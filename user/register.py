from flask import jsonify, request
import uuid
from database import db  
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from google.oauth2 import service_account
from google_auth_oauthlib.flow import Flow
from google.oauth2.credentials import Credentials
import os

# Google Drive API Setup
SCOPES = ["https://www.googleapis.com/auth/drive.file", "https://www.googleapis.com/auth/drive.readonly"]
CLIENT_SECRETS_FILE = 'client_secret.json'
ROOT_FOLDER_ID = "1NndBdfWTZl4ZMjGZWWb1UjgeVijl986v"
ARCHIVE_FOLDER_ID = "1GM5-ZA57QPylEhcMexwhhVmdd2g09ZRX"


flow = Flow.from_client_secrets_file(
    CLIENT_SECRETS_FILE,
    scopes=SCOPES,
    redirect_uri='http://localhost:6000/callback'
)

def get_drive_service():
    """Authenticate using OAuth 2.0 and return the Google Drive service."""
    creds = None
    
    # Check if token exists
    if os.path.exists('token.json'):
        creds = Credentials.from_authorized_user_file('token.json', SCOPES)

    # If no valid credentials, perform authentication
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = Flow.from_client_secrets_file(
                CLIENT_SECRETS_FILE,
                scopes=SCOPES,
                redirect_uri='http://localhost:6000/callback'
            )
            auth_url, _ = flow.authorization_url(prompt='consent')
            print(f"Please go to this URL and authorize access: {auth_url}")

            # Capture authorization code
            code = input('Enter the authorization code: ')
            flow.fetch_token(code=code)
            creds = flow.credentials
            
            # Save credentials for future use
            with open('token.json', 'w') as token_file:
                token_file.write(creds.to_json())

    return build('drive', 'v3', credentials=creds)

def create_drive_folder(folder_name, parent_folder_id=ROOT_FOLDER_ID):
    """Create a new folder in Google Drive and return the folder ID."""
    service = get_drive_service()
    try:
        file_metadata = {
            "name": folder_name,
            "mimeType": "application/vnd.google-apps.folder",
            "parents": [parent_folder_id]
        }
        folder = service.files().create(body=file_metadata, fields="id").execute()
        print(f"✅ Folder created with ID: {folder.get('id')}")
        return folder.get("id")
    except Exception as e:
        print(f"❌ Error creating folder: {e}")
        return None


def move_drive_folder(folder_id, new_parent_id):
    """Move a Google Drive folder to a new parent folder (archive)."""
    service = get_drive_service()
    try:
        service.files().update(
            fileId=folder_id,
            addParents=new_parent_id,
            removeParents=ROOT_FOLDER_ID,
            fields="id, parents"
        ).execute()
        print(f"✅ Moved folder {folder_id} to Archive")
    except Exception as e:
        print(f"❌ Error moving folder {folder_id}: {e}")

class Players:
    @staticmethod
    def signup():
        try:
            # Get form data
            players = {
                "_id": uuid.uuid4().hex,
                
                "rfid": request.json.get("rfid", "").strip(), 
                "firstname": request.json.get("firstname", "").strip(),
                "middlename": request.json.get("middlename", "").strip(),
                "lastname": request.json.get("lastname", "").strip(),
                "category": request.json.get("category", "").strip(),
                "age": request.json.get("age", "").strip(),
                "belt": request.json.get("belt", "").strip(),
                "gym": request.json.get("gym", "").strip(),
                "weight": request.json.get("weight", "").strip(),
                "weight_category": request.json.get("weight_category", "").strip(),
            }

            # Debugging: Print received data
            print(f" Received Player Data: {players}")

            # Validate required fields
            missing_fields = [key for key, value in players.items() if not value]
            if missing_fields:
                return jsonify({"error": f"Missing fields: {', '.join(missing_fields)}"}), 400

            if db.players.find_one({"rfid": players["rfid"]}):
                print("❌ Duplicate RFID detected")  # Debugging
                return jsonify({"error": "RFID already exists"}), 400


            # Generate full name for folder
            full_name = f"{players['firstname']} {players['middlename']} {players['lastname']}".strip()

            # Create Google Drive folder for the player
            folder_id = create_drive_folder(full_name)

            if not folder_id:
                return jsonify({"error": "Failed to create player folder in Google Drive"}), 500

            # Store folder ID in the database
            players["folder_id"] = folder_id

            # Insert into the database
            result = db.players.insert_one(players)

            if result.acknowledged:
                print(f" Player {full_name} registered successfully with folder ID {folder_id}")
                return jsonify({"message": "Signup successful", "folder_id": folder_id}), 200
            
             
            return jsonify({"error": "Signup failed"}), 500

        except Exception as e:
            import traceback
            print(" ERROR in signup:", traceback.format_exc())  # Print full error
            return jsonify({"error": str(e)}), 500

    @staticmethod
    def archive_players():
        """Archive players and move their folders to the archive folder."""
        try:
            players = list(db.players.find({}))  # Fetch all players
            
            if not players:
                return jsonify({"error": "No players to archive"}), 400

            for player in players:
                folder_id = player.get("folder_id")
                if folder_id:
                    move_drive_folder(folder_id, ARCHIVE_FOLDER_ID)  # Move folder to archive

            # Remove players from active database after archiving
            db.players.delete_many({})
            return jsonify({"message": "Players archived successfully!"}), 200
        except Exception as e:
            print(f" Error archiving players: {e}")
            return jsonify({"error": str(e)}), 500