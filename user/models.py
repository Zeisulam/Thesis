from flask import jsonify, request, session, redirect
import uuid
from werkzeug.security import generate_password_hash, check_password_hash
from database import db  

class User:

    @staticmethod
    def start_session(user):
        session['logged_in'] = True
        session['user'] = user
        session.permanent = False  # Ensure session is non-permanent
        user['_id'] = str(user['_id'])
        return jsonify(user), 200
    
    @staticmethod
    def signup():
        user = {
            "_id": uuid.uuid4().hex,
            "firstname": request.form.get('firstname'),
            "middlename": request.form.get('middlename'),
            "lastname": request.form.get('lastname'),
            "birthdate": request.form.get('birthdate'),
            "age": request.form.get('age'),
            "belt": request.form.get('belt'),
            "gym": request.form.get('gym'),
            "role": request.form.get('role'),
            "username": request.form.get('username'),
            "password": generate_password_hash(request.form.get('password')),  # Hash password
        }

        if db.users.find_one({ "username": user['username'] }):
            return jsonify({"error": "Username is already taken"}), 400
        
        if db.users.insert_one(user):
            return jsonify({"message": "Signup successful"}), 200  # No session started here

        return jsonify({"error": "Signup failed"}), 400
    
    @staticmethod
    def signout():
        session.clear()  # Clears session
        return redirect('/login')
    
    @staticmethod
    def login():
        user = db.users.find_one({
            "username": request.form.get('username')
        })

        if user and check_password_hash(user["password"], request.form.get('password')):  # Check password
            return User.start_session(user)  # Start session here

        return jsonify({"error": "Invalid login credentials"}), 401
