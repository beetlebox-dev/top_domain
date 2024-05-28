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

FLOW_REDIRECT_URL = 'https://admin.beetlebox.dev/gmail_token_redirect'

# If modifying these scopes, delete the file token.json.
SCOPES = ["https://www.googleapis.com/auth/gmail.send", ]
# SCOPES = ["https://www.googleapis.com/auth/gmail.readonly", ]
# SCOPES = ["https://mail.google.com/", ]  # Full access.


def send_gmail(to_addr, subject, message_text):

    # Get gmail api credentials.
    token = retrieve_token()
    if token is None:
        # TODO: Developer doesn't get notified via admin alert here!
        return

    # Encode email data.
    email_obj = EmailMessage()
    email_obj["From"] = GMAIL_SENDER_ADDRESS
    email_obj["To"] = to_addr
    email_obj["Subject"] = subject
    email_obj.set_content(message_text)
    encoded_email_bytes = base64.urlsafe_b64encode(email_obj.as_bytes()).decode()

    # Send email.
    try:
        service = build("gmail", "v1", credentials=token)
        sent_message = service.users().messages().send(userId="me", body={"raw": encoded_email_bytes}).execute()
        print(f'Sent Message | Subject: {subject} | Id: {sent_message["id"]}')
    except HttpError as error:
        # TODO(developer) - Handle errors from gmail API.
        print(f'ERROR SENDING MESSAGE WITH THE GMAIL API! Error: {error}')


def retrieve_token():
    """Prepare credentials from token.json and/or credentials.json. Updates json files and returns updated creds.
If browser approval is needed, returns None."""

    # Send credentials.json and token.json to temp for retrieval within server.
    serve = Serve(STORE_BUCKET_NAME, STORE_TOP_FOLDER, TEMP_TOP_FOLDER)
    serve.file_from_store_to_temp('credentials.json')
    try:
        serve.file_from_store_to_temp('token.json')
    except Exception as e:
        print(f'Unable to retrieve token.json at store. Will attempt to generate new token.json. \n'
              f'Exception thrown: {e}')

    # Prepare gmail api credentials.
    token = None
    # The file token.json stores the user's access and refresh tokens,
    # and is created automatically when the authorization flow completes for the first time.
    if os.path.exists(serve.temp_full_path('token.json')):
        token = Credentials.from_authorized_user_file(serve.temp_full_path('token.json'), SCOPES)

    # If there are no (valid) credentials available, let the user log in.
    if not token or not token.valid:

        need_browser_approve = True
        if token and token.expired and token.refresh_token:
            # Existing token is not valid.
            try:
                token.refresh(Request())
            except Exception as e:
                print(f'COULD NOT REFRESH EXISTING TOKEN! Error: {e}')
            else:
                # Refreshed existing token successfully.
                need_browser_approve = False

        if need_browser_approve:
            # Token.json doesn't exist, or is no longer valid (expired, etc.), or token.refresh() unsuccessful.
            # This has to be handled at admin.beetlebox.dev manually.
            print('BROWSER APPROVAL NEEDED TO UPDATE GMAIL API CREDENTIALS! '
                  'Go to https://admin.beetlebox.dev/gmail_token to fix.')
            return None

        # Update token.json for the next run.
        update_token_json(serve, token)

    return token


def update_token_json(serve, token):
    """Updates token.json for future retrieval."""
    serve.send('token.json', token.to_json(), 'store')


def get_auth_url_for_generating_new_token(credentials_json_temp_path):
    """Call this function, then open the returned URL to initiate generating a new token."""
    flow = InstalledAppFlow.from_client_secrets_file(credentials_json_temp_path, SCOPES)
    flow.redirect_uri = FLOW_REDIRECT_URL
    return flow.authorization_url()[0]


def generate_new_token(credentials_json_temp_path, google_redirect_url):
    """Call this function to finish generating a new token, passing in the google_redirect_url.
The google_redirect_url is the full URL to which Google redirects after completing the authentication flow at the URL
from get_auth_url_for_generating_new_token(), and is the base FLOW_REDIRECT_URL plus additional request args
which contain the data needed to create a new token. Returns the new flow.credentials."""
    flow = InstalledAppFlow.from_client_secrets_file(credentials_json_temp_path, SCOPES)
    flow.redirect_uri = FLOW_REDIRECT_URL
    flow.fetch_token(authorization_response=google_redirect_url, audience=None)
    return flow.credentials
