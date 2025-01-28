import os.path
import base64
from email.message import EmailMessage

# pip install --upgrade google-api-python-client google-auth-httplib2 google-auth-oauthlib
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

from persist import Serve


GMAIL_SENDER_ADDRESS = os.getenv('GMAIL_SENDER_ADDRESS')
STORE_BUCKET_NAME = 'app-storage-bucket'
STORE_TOP_FOLDER = 'gmail_api_store/'
TEMP_TOP_FOLDER = 'gmail_api_temp/'


# If modifying these scopes, delete the file token.json.
SCOPES = ["https://www.googleapis.com/auth/gmail.send", ]
# SCOPES = ["https://www.googleapis.com/auth/gmail.readonly", ]
# SCOPES = ["https://mail.google.com/", ]  # Full access.


def send_gmail(to_addr, subject, message_text, repair_token_and_test=False):

    log_list = []

    def log(log_str):
        log_list.append(log_str)
        print(log_str)
        # if error:
        #     raise Exception(log_str)
        # else:
        #     print(log_str)

    log('Send_gmail() called.')

    # Retrieve desktop_credentials.json and token.json.
    serve = Serve(STORE_BUCKET_NAME, STORE_TOP_FOLDER, TEMP_TOP_FOLDER)
    if not os.path.exists(serve.temp_full_path('desktop_credentials.json')):
        log('Could not find desktop_credentials.json in temp folder. Will move to temp folder from store.')
        serve.file_from_store_to_temp('desktop_credentials.json')
    if not os.path.exists(serve.temp_full_path('token.json')):
        log('Could not find token.json in temp folder. Will move to temp folder from store.')
        try:
            serve.file_from_store_to_temp('token.json')
            log('Completed move of token.json from store to temp folder.')
        except Exception as e:
            log(f'Unable to retrieve token.json at store. Will attempt to create new token.json. \nException thrown: {e}')

    # Prepare gmail api credentials.
    creds = None
    # The file token.json stores the user's access and refresh tokens,
    # and is created automatically when the authorization flow completes for the first time.
    if os.path.exists(serve.temp_full_path('token.json')):
        log(f'Found token.json in temp folder. Will attempt to create credentials from the file data.')
        creds = Credentials.from_authorized_user_file(serve.temp_full_path('token.json'), SCOPES)
    # If there are no (valid) credentials available, let the user log in.
    if not creds or not creds.valid:
        log('Credentials data is empty, expired, or not valid.')
        if creds and creds.expired and creds.refresh_token:
            log('Credentials data is expired and there exists a refresh token.')
            creds.refresh(Request())
        else:
            if repair_token_and_test:
                log('Needs browser approval. Initiating browser approval flow.')
                flow = InstalledAppFlow.from_client_secrets_file(serve.temp_full_path('desktop_credentials.json'), SCOPES)
                creds = flow.run_local_server(port=0)  # Sends to Google for authentication, then retrieves data upon redirect back.
                log('Completed browser approval flow.')
            else:
                log(f'Needs browser approval, but repair_token_and_test is {repair_token_and_test}.')
                # todo handle. Error: need browser approve, but called by web app.
                # return
        creds_json = creds.to_json()
        log(f'Saving credentials to token.json for future runs: {creds_json}')
        # Save the credentials for the next run.
        # with open(serve.temp_full_path('token.json'), 'w') as token:
        #     token.write(creds.to_json())
        serve.send('token.json', creds_json, 'temp')
        serve.file_to_store_from_temp('token.json')

    log(f'Credentials = {creds.to_json()}')

    # Encode email data.
    log_str = '\n'.join(log_list)
    # message_text += log_str
    if repair_token_and_test:
        message_text += '\n' + log_str
    else:
        pass
        # todo admin_alert - beware circular imports
    email_obj = EmailMessage()
    email_obj["From"] = GMAIL_SENDER_ADDRESS
    email_obj["To"] = to_addr
    email_obj["Subject"] = subject
    email_obj.set_content(message_text)
    encoded_email_bytes = base64.urlsafe_b64encode(email_obj.as_bytes()).decode()

    # Send email.
    service = build("gmail", "v1", credentials=creds)
    try:
        service = build("gmail", "v1", credentials=creds)
        sent_message = service.users().messages().send(userId="me", body={"raw": encoded_email_bytes}).execute()
        log(f'Sent Message  ==>  | Id: {sent_message["id"]} | Subject: {subject} |')
    except HttpError as error:
        # TODO(developer) - Handle errors from gmail API.
        log(f'Error sending email with subject: {subject} \nException: {error} ')
