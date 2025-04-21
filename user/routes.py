from flask import Blueprint
from user.models import User  
from user.register import Players


user_bp = Blueprint('user_bp', __name__)

@user_bp.route('/logout', methods=['GET'])
def logout():
    return User.signout()

@user_bp.route('/user/signup', methods=['POST'])
def signup():
    return User.signup()  # Call static method

@user_bp.route('/user/login', methods=['POST'])
def login():
    return User.login()  # Call static method

# Player routes
@user_bp.route('/players/signup', methods=['POST'])
def player_signup():
    return Players.signup()  
# Call static method

