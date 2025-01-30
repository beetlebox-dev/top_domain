import json
import pickle
import os
import shutil
from google.cloud import storage  # pip install --upgrade google-cloud-storage


def get_root_dir(file_path):
    """Used in the google.cloud.storage module.
I.E. 'path/to/file' => 'path' OR '/path/to/file' => 'path' OR '/file' => '' OR 'file' => ''"""
    file_path_split = file_path.split('/')
    if len(file_path_split) < 2:
        return ''  # File_path just contains the file name.
    elif len(file_path_split) > 2 and file_path_split[0] == '':
        return file_path_split[1]  # I.E., return 'root_dir' in '/root_dir/file'.
    else:
        return file_path_split[0]

def remove_file_from_path_str(file_path):
    """I.E. 'path/to/file' => 'path/to' OR '/file' => '' OR 'file' => ''"""
    file_path_split = file_path.rsplit('/', 1)  # Split in 2 segments at the rightmost '/'.
    if len(file_path_split) < 2:
        file_path_directory = ''  # Root.
    else:
        file_path_directory = file_path_split[0]  # Path without file.
    return file_path_directory

def create_directory_if_needed(file_path):
    # Create new directory if one does not exist.
    file_path_directory = remove_file_from_path_str(file_path)
    if not os.path.exists(file_path_directory):
        # Create new directories in path that do not exist.
        os.makedirs(file_path_directory)


class Serve:
    """For store_top_folder and temp_top_folder at init,
path strings must end with a forward slash, i.e. 'parent_folder/child_folder/'."""

    def __init__(self, store_bucket_name='UnUsEd_BuCkEt', store_top_folder='UnUsEd_StOrE_FoLdEr/',
                 temp_top_folder='UnUsEd_TeMp_FoLdEr/'):
        self.store_bucket_name = store_bucket_name
        self.store_top_folder = store_top_folder
        self.temp_top_folder = temp_top_folder
        self.clear_stored_bucket_and_blobs()

    def clear_stored_bucket_and_blobs(self):
        self.bucket = None
        self.blobs = {}

    def store_full_path(self, file_path):
        full_path = f'{self.store_top_folder}{file_path}'
        return full_path

    def temp_full_path(self, file_path):
        full_path = f'{self.temp_top_folder}{file_path}'
        return full_path

    def get_bucket(self):
        storage_client = storage.Client()
        self.bucket = storage_client.bucket(self.store_bucket_name)

    def get_blob(self, file_path):
        if file_path not in self.blobs:
            if self.bucket is None:
                self.get_bucket()
            full_path = f'{self.store_top_folder}{file_path}'
            blob = self.bucket.blob(full_path)
            self.blobs[file_path] = blob
        return self.blobs[file_path]

    def open(self, file_path, mode, location):
        """Location can be 'temp' or 'store'."""
        if location == 'temp':
            full_path = self.temp_full_path(file_path)
            create_directory_if_needed(full_path)
            return open(full_path, mode)
        else:
            blob = self.get_blob(file_path)
            return blob.open(mode)

    def delete(self, file_path, location='temp'):
        if location == 'temp':
            os.remove(file_path)
        else:
            blob = self.get_blob(file_path)
            blob.delete()
            if file_path in self.blobs:
                del self.blobs[file_path]

    def receive(self, file_path, location='temp', return_string=False):
        """If return_string is True, a string is returned regardless of the source file type.
Otherwise, a dictionary/list is returned from json and pkl files (pkl files may theoretically also return a string),
or a list of lines from non-json/pkl files (i.e. .txt files)."""

        if file_path[-4:] == '.pkl':
            mode = 'rb'
        else:
            mode = 'r'

        with self.open(file_path, mode, location) as file:
            if mode == 'rb':
                # Pickle file.
                data_obj = pickle.load(file)
                if return_string:
                    return str(data_obj)
                else:
                    return data_obj
            elif return_string:
                return file.read()
            elif file_path[-5:] == '.json':
                data_obj = json.load(file)
                return data_obj
            else:
                whole_str = file.read()
                line_list = whole_str.split('\n')
                return line_list

    # TODO: thread?
    def send(self, file_path, new_contents, location='temp', pickle_mode=False):

        if pickle_mode:
            mode = 'wb'
        else:
            mode = 'w'

        with self.open(file_path, mode, location) as file:
            if pickle_mode:
                pickle.dump(new_contents, file)
            elif isinstance(new_contents, dict) or isinstance(new_contents, list):
                json.dump(new_contents, file, indent=4)
            else:
                file.write(str(new_contents))

        if location != 'temp' and file_path in self.blobs:
            # New blob must be opened next time.
            del self.blobs[file_path]

    # # DEPRECATED! Use send().
    # def upload(self, file_path, new_contents):
    #     blob = self.get_blob(file_path)
    #     if isinstance(new_contents, dict):
    #         contents_str = json.dumps(new_contents, indent=4)
    #     else:
    #         contents_str = str(new_contents)
    #     blob.upload_from_string(contents_str)
    #     if file_path in self.blobs:
    #         # New blob must be opened next time.
    #         del self.blobs[file_path]

    def append(self, file_path, new_lines, location='temp', max_lines=None):
        """Pass in new_lines as a list of strings.
Final line count after append will not exceed max_lines at store location. Max lines is not respected at temp location!
Set max_lines to None (default) for no maximum. Do not use for json or pickle files!
If given an empty file, new_lines will appear after an empty first line."""

        if location == 'temp':
            new_str = '\n' + '\n'.join(new_lines)
            with self.open(file_path, 'a', 'temp') as file:
                file.write(new_str)  # TODO: thread?

        else:
            existing_lines = self.receive(file_path, 'store') # Running receive() on an empty file returns [''].
            existing_lines.extend(new_lines)
            if max_lines is not None:
                del existing_lines[:-max_lines]
            new_str = '\n'.join(existing_lines)
            self.send(file_path, new_str, 'store')

    def file_to_store_from_temp(self, store_file_path, temp_file_path=None):  # TODO: thread?
        """If temp_file_path is not passed in, the corresponding temp path from store_file_path will be calculated."""
        if temp_file_path is None:
            temp_file_path = self.temp_full_path(store_file_path)
        blob = self.get_blob(store_file_path)
        blob.upload_from_filename(temp_file_path)
        # TODO: Need below as in send()???
        #  if store_file_path in self.blobs: del self.blobs[store_file_path]

    def file_from_store_to_temp(self, store_file_path, temp_file_path=None):
        """If temp_file_path is not passed in, the corresponding temp path from store_file_path will be calculated."""
        if temp_file_path is None:
            temp_file_path = self.temp_full_path(store_file_path)
        create_directory_if_needed(temp_file_path)
        blob = self.get_blob(store_file_path)
        blob.download_to_filename(temp_file_path)

    def copy_file(self, copy_from_file_path, copy_to_file_path=None, location='temp'):
        # Copy locations are temp to temp, or store to store.
        if copy_to_file_path is None:
            copy_to_file_path = f'{copy_from_file_path}_copy'
        if location == 'temp':
            shutil.copy(copy_from_file_path, copy_to_file_path)
        else:
            blob_to_copy = self.get_blob(copy_from_file_path)
            self.bucket.copy_blob(blob_to_copy, self.bucket, copy_to_file_path)
