from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi

uri = "mongodb+srv://aiprojectstorages:opm9gSc2O6TAhNNe@cluster1.ux7xwgg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster1"

# Create the MongoDB client with Server API version
client = MongoClient(uri, server_api=ServerApi('1'))

# Select your database
db = client['data']  # or just db = client.data

# Optional: Test the connection
try:
    client.admin.command('ping')
    print("Pinged your deployment. You successfully connected to MongoDB!")
except Exception as e:
    print("Connection failed:", e)