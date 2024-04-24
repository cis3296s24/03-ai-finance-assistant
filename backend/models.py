#Contains SQLAlchemy model definitions

from config import db

class Contact(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(80), unique=False, nullable=False)
    last_name = db.Column(db.String(80), unique=False, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)    #email will act as username
    password = db.Column(db.String(15), unique=False, nullable=False)


    def to_json(self):
        return {
            "id": self.id,
            "firstName": self.first_name,
            "lastName": self.last_name,
            "email": self.email,
            "password": self.password,
        }


class Finances(db.Model):
    id = db.Column(db.Integer, primary_key=True)
   # contact_id = db.Column(db.Integer, db.ForeignKey('contact.id'), nullable=False)
    month = db.Column(db.String(2), nullable=False)
    date = db.Column(db.String(8), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    category = db.Column(db.String(50), nullable=False)

    #one to many (one contact linked to many finances)
   # contact = db.relationship('Contact', backref=db.backref('finances', lazy=True))

    def to_json(self):
        return {
            "id": self.id,
         #   "contact_id": self.contact_id,
            "Month": self.month,
            "Date": self.date,
            "Amount": self.amount,
            "Category": self.category,
        }