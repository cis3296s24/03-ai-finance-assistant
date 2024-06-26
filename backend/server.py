from flask import jsonify, request
from config import app, db
from models import Contact, Finances
import os
from werkzeug.utils import secure_filename
from datetime import date
import yfinance as yf
from prophet import Prophet
from prophet.plot import plot_plotly
import pandas as pd
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
import time
from pdfminer.high_level import extract_text
from PyPDF2 import PdfReader
import statsmodels.api as sm
import re
import csv


app.config['JWT_SECRET_KEY'] = 'key'
jwt = JWTManager(app)

# upload folder stuff
app.config['UPLOAD_FOLDER'] = 'UPLOAD_FOLDER'

if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'])

@app.route('/upload', methods = ['POST'])
def upload_file():
    """
    gets the file from frontend and saves it in UPLOAD FOLDER. 
    1) checks for condition if no file gets uploaded gives a 400 error. 
    2) if file's name is an empty string returns a 400 error
    3) If it is a proper file, then it it saves the file in the UPLOAD_FOLDER by creating a path.

    :return: JSON and status of the result.
    """
    if 'file' not in request.files:
       return 'No file part', 400
    file = request.files['file']
    if file.filename == '':
       return "No Selected file", 400
    if file:
       filename = secure_filename(file.filename)
       print("This is the file ", filename)
       file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
       return "File uploaded successfully", 200


# def get_data():
    # data = {"message": "Hello from the Python backend!"}
    # return jsonify(data)

@app.route('/message', methods=['GET', 'POST'])
def get_data():
    """
    Simple test function
    1) If the request is GET then send a sample test 
    2) If request is POST then retrevive the data 
    :return: JSON dictionary and status of the result.
    """
  
    
    if request.method == "GET":
        return jsonify({"message": ["Member 1", "Member2", "Member3"]}), 200
        #return {"message": "Member1, Member2, Member3"}

    elif request.method == "POST":
        name = request.json.get('name')
        print("name is:", name)
        return jsonify({"message": "Received", "name": name}), 200
    

@app.route('/get_stock', methods=["GET"])
def get_stock():
    """
    Retrieves stock data and makes prediction on future stock prices

    :param a: a stock ticker
    :param b: number of years of predicton
    :return: JSON with graph of stock prediction, the current price, and the latest prediction
    """

    START = "2015-01-01"
    TODAY = date.today().strftime("%Y-%m-%d")

    stock_ticker = request.args.get('stock')
    n_years = int(request.args.get('years'))
    period = n_years * 365

    data = yf.download(stock_ticker,START, TODAY)
    data.reset_index(inplace=True)

    df_train = data[['Date','Close']]
    df_train = df_train.rename(columns={"Date": "ds", "Close": "y"})

    m = Prophet()
    m.fit(df_train)

    future = m.make_future_dataframe(periods=period)
    forecast = m.predict(future)

    fig1 = plot_plotly(m, forecast)
    graph_json = fig1.to_json()

    latest_prediction = forecast.iloc[-1]['yhat']
    stock_info = yf.Ticker(stock_ticker)
    current_price = stock_info.history(period="1d")['Close'].iloc[-1]
    response = {
        "latest_prediction": latest_prediction,
        "current_price": current_price,
        "graph": graph_json
    }
    return jsonify(response)



@app.route('/get_transaction_data', methods=["GET"])
def getTransactionData():
    """
    1) This function waits until there is a transactions.csv file available. 
    2) Once the file is available we retreive the data for each month and then sum up the distinct
    category for each month
    3) result is a dictionary with key as month and value as an array of each category and their 
    summed amount for each month.
    

    :return: JSON dictionary with the status of the dictionary. 
    """
    while not os.path.exists("Your path to transactions.csv in the UPLOAD_FOLDER"):
        print("Waiting for the csv file")
        time.sleep(10)
    
    df = pd.read_csv("Your path to transactions.csv in the UPLOAD_FOLDER")
    groupedElements = df.groupby(["Month", "Category"])["Amount"].sum().unstack(fill_value=0).stack().reset_index(name="Amount")
    #print(groupedElements)
    result = groupedElements.groupby("Month").apply(lambda x: x[["Category", "Amount"]].to_dict('records')).to_dict()
    #print(result)
    return jsonify(result)


@app.route("/get_income", methods=["POST"])
def getUserIncome():
    """
    1) Gets the income from the user a POST request. 
    
    :return: JSON dict with success message and monthly_income from the user.
    """
    
    data = request.get_json()
    annual_income = data['income']
    period = data['period']

    monthly_income = annual_income / 12 if period == 'yearly' else annual_income
    return jsonify({"status": "success", "message": "Income received", "monthlyIncome": monthly_income}), 200



@app.route("/final-submit", methods=["POST"])
def createTheCSVFile():
    """
    1) This function loops through all the files in the UPLOAD_FOLDER.
    2) Once there is a file it extracts text from the pdf. 
    3) The pdf text then follows a regex pattern and we get the text we need from the PDF like dates, amount and category. 
    4) Once there are matches found we push this data into a CSV file. 
    
    :return: JSON message if the data retrevial was succesful with status
    """
    dir = "Your path to UPLOAD_FOLDER"
    response = {}
    for filename in os.listdir(dir):
        if filename.lower().endswith(".pdf"):
            filepath = os.path.join(dir, filename)
            pdf_text = extractTextFromPDF(filepath)
            #print(pdf_text)
            if pdf_text:
                datePattern = r'^(\d{2}/\d{2}/\d{2})'
                dateMatches = re.findall(datePattern, pdf_text, re.MULTILINE)
                pattern = r'\$(\d{1,3}(?:,\d{3})*\.\d{2})([A-Za-z /]+)'
                matches = re.findall(pattern, pdf_text)
                
                if (len(matches) == 0):
                    pattern = r'\$\s*(-?\d{1,3}(?:,\d{3})*\.\d{2})\s+([A-Za-z/ ]+)'
                    matches = re.findall(pattern, pdf_text)
                
                addMatchesToCsvFile(filename, matches, dateMatches)
            #     for amount, category in matches:
            #         print(f"Amount: ${amount}, Category: {category.strip()}")
            #     for dates in dateMatches:
            #         print(dates)
            # else:
            #     print(f"No text extracted from {filename}")
                response[filename] = {
                    "amounts_categories": matches,
                    "dates": dateMatches
                }
            else:
                response[filename] = "No text extracted"
                    
    return jsonify(response)


def addMatchesToCsvFile(filename, matches, dateMatches):
    """
    1) This function creates the CSV file
    2) First it creates the transactions.csv in the UPLOAD_FOLDER if it does not exist.
    3) Next it creates a header if it does not exist
    4) Lastly it just appends the data from the regex pattern matches. 
    
    :param a: The filename is important as we need to get the month data. 
    :param b: This is the matches from the PDF file.
    :param c: This is the date matches from the PDF file
    :return: JSON dictionary with the status of the dictionary. 
    """
    dir = "Your path to UPLOAD_FOLDER"
    if not os.path.exists(dir):
        os.makedirs(dir)
    
    # index funds ETFS, bonds, Crypto, 
    
    csvFilename = "transactions.csv"
    csvFilePath = os.path.join(dir, csvFilename)
    
    writeHeader = not os.path.exists(csvFilePath)
    with open(csvFilePath, "a", newline='') as file:
        writer = csv.writer(file)
        
        
        if writeHeader:
           writer.writerow(['Month', "Date", "Amount", "Category"])
        
        # removing the pdf
        filename = filename[0:len(filename)-4]
        month = getMonth(filename)
        for (amount, category), date in zip(matches, dateMatches):
            #amount = float(amount)
            if category != "Payments and Credits":
                try:
                    category = customizeCategory(category)
                    amount = float(amount.replace(',', ''))  # Remove commas and convert to float
                    writer.writerow([month, date, amount, category])
                except ValueError:
                    print(f"Skipping invalid amount: {amount}")
            else:
                continue
            
def customizeCategory(category):
    """
    Just changing the category in case of any external string added to the file. 
    :param a: category, each category is tested to make sure we provide the most accurate category to the user.
    :return: category which is the fixed string of the category
    """
    category = category.strip()
    
    categories = {
        "Travel/ Entertainment": "Travel/Entertainment",
        "Supermarkets": "Supermarkets",
        "Restaurants": "Restaurants",
        "Merchandise": "Merchandise",
        "Gasoline": "Gasoline",
        "Home Improvement": "Home Improvement",
        "Services": "Services"
        
    }
    
    for key, value in categories.items():
        if category.startswith(key):
            return value
        
    return category

@app.route("/get_predicted_data", methods=["GET"])
def getPredictedData():
    """
    1) This function predicts user's transaction for the next month. 
    2) It uses a linear regression ML model for the predicition. 
    
    :return: JSON dictionary of each category and the amount spend for that category
    """
    df = pd.read_csv("Your path to transactions.csv")

    dummies = pd.get_dummies(df['Category'])
    df = pd.concat([df, dummies], axis=1)

    df.drop(['Date', 'Category', "Month"], axis=1, inplace=True)

    # Here is the independent varable. So, X is the column Amount
    X = df.drop('Amount', axis=1)
    # Adding a constant term to the prediction
    X = sm.add_constant(X) 

    # Define the dependent variable
    y = df['Amount']

    # Fit the linear regression model
    model = sm.OLS(y, X).fit()
    # Creating a dictionary for all categories with default values of 0
    catDict = {cat: 0 for cat in X.columns if cat != 'const'}
    catDict['const'] = 1  # Add constant to the dictionary

    # Dictionary to store predictions
    predictions = {}

    for category in catDict:
        if category == 'const':
            continue
        catDict[category] = 1  
        new_data = pd.DataFrame([catDict]) 
        predicted_amount = model.predict(new_data)  # Predicting the amount
        predictions[category] = predicted_amount.iloc[0]  # Storing the prediction
        catDict[category] = 0 
        
    print(predictions)

    return jsonify(predictions)
    
    
    
            
def getMonth(fileName):
    """
    1) This function given the file name returns the month. 
    
    :return: int with the corresponding month.
    """
    # Jan 1, Feb 2, Mar 3, Apr 4, May 5, Jun 6, Jul 7, Aug 8, Sep 9, Oct 10, Nov 11, 
    if fileName.startswith("Jan"):
        return 1
    elif fileName.startswith("Feb"):
        return 2
    elif fileName.startswith("Mar"):
        return 3
    elif fileName.startswith("Apr"):
        return 4
    elif fileName.startswith("May"):
        return 5
    elif fileName.startswith("Jun"):
        return 6
    elif fileName.startswith("Jul"):
        return 7
    elif fileName.startswith("Aug"):
        return 8
    elif fileName.startswith("Sep"):
        return 9
    elif fileName.startswith("Oct"):
        return 10
    elif fileName.startswith("Nov"):
        return 11
    else:
        return 12
        
        

def extractTextFromPDF(pdf_path):
    """
    1) This function uses the PdfReader and reads the pdf data from each page of the file. 
    
    
    :return: returning a string with all the text from the file
    """
    # if the other hard way is not working, we have to use this function
    
    try:
        reader = PdfReader(pdf_path) 
        text = ""
        for page in reader.pages:  
            text += page.extract_text() 
        return text
    except Exception as e:
        print(f"Failed to process {pdf_path}: {str(e)}")
        return ""



   
# Retrieve a contact
@app.route("/get_contacts", methods=["GET"])
def get_contacts():
    """
    Retrieve all contacts from database and return them as JSON.

    :return: JSON object containing a list of contacts
    :rtype: Response
    """
    contacts = Contact.query.all()
    json_contacts = list(map(lambda x: x.to_json(), contacts))
    return jsonify({"contacts": json_contacts})






# Create a contact
@app.route('/create_contact', methods=['POST'])
def create_contact():
    """
    Create a new contact using JSON data and add it to the database.
    Checks if the email already exists in the database to prevent duplicates.

    :return: JSON response with either a success or error message and the appropriate status code
    :rtype: Response
    """
    data = request.json
    new_contact = Contact(
        first_name=data['firstName'],
        last_name=data['lastName'],
        email=data['email'],
        password=data['password']
    )

    # Check if the email already exists
    if Contact.query.filter_by(email=new_contact.email).first():
        return jsonify({"message": "Email already exists"}), 400

    try:
        db.session.add(new_contact)
        db.session.commit()
        return jsonify({"message": "User created"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": str(e)}), 400



# Update a contact
@app.route("/update_contact/<int:user_id>", methods=["PATCH"])
def update_contact(user_id):
    """
    Update an existing contact identified by user_id with data from JSON.

    :param user_id: ID of the contact to be updated
    :type user_id: int
    :return: JSON with a success or error message 
    :rtype: Response
    """

    contact = Contact.query.get(user_id)

    if not contact:
        return jsonify({"message": "User not found"}), 404

    data = request.json
    contact.first_name = data.get("firstName", contact.first_name)
    contact.last_name = data.get("lastName", contact.last_name)
    contact.email = data.get("email", contact.email)
    contact.password = data.get("password", contact.password)


    db.session.commit()

    return jsonify({"message": "User updated."}), 200


# Delete a contact
@app.route("/delete_contact/<int:user_id>", methods=["DELETE"])
def delete_contact(user_id):
    """
    Delete a contact identified by user_id from  database.

    :param user_id: ID 
    :type user_id: int
    :return: JSON response with a success or error message 
    :rtype: Response
    """
    contact = Contact.query.get(user_id)

    if not contact:
        return jsonify({"message": "User not found"}), 404

    db.session.delete(contact)
    db.session.commit()

    return jsonify({"message": "User deleted!"}), 200



@app.route('/loginpage', methods=['POST'])
def login():
    """
    Handle  login by verifying email and password with values in  database.
    Returns a success message if user exists, otherwise returns an error.

    :return: JSON response of the result of the login attempt.
    :rtype: Response
    """
    email = request.json.get('email', None)
    password = request.json.get('password', None)
    contact = Contact.query.filter_by(email=email).first()
    if contact and contact.password == password:
        access_token = create_access_token(identity=email)
        return jsonify(access_token=access_token), 200
    
    return jsonify({"msg": "Wrong email or password"}), 401



def csv_to_db(csv_path):
    try:
        df = pd.read_csv(csv_path)

        #testing
        print("DataFrame Columns:", df.columns) 
        print(df.head()) 

        for index, row in df.iterrows():
            new_entry = Finances(
               # contact_id=row['contact_id'],
                month=row['Month'],
                date=row['Date'],
                amount=row['Amount'],
                category=row['Category']
            )
            db.session.add(new_entry)
        db.session.commit()
        return "Data uploaded to DB"
    except Exception as e:
        db.session.rollback()
        print(e)  
        return str(e)

@app.route('/process_finances', methods=['POST'])
def process_finances():
    csv_path = os.path.join(app.config['UPLOAD_FOLDER'], 'transactions.csv')
    if os.path.exists(csv_path):
        result = csv_to_db(csv_path)
        if result == "Data uploaded and inserted successfully":
            return jsonify({"message": result}), 200
        else:
            return jsonify({"error": result}), 500
    else:
        return jsonify({"error": "CSV file not found"}), 404
    


@app.route('/loginpage', methods=['POST'])
def login():
    email = request.json.get('email', None)
    password = request.json.get('password', None)

    contact = Contact.query.filter_by(email=email).first()
    
    if contact and contact.password == password:
        return jsonify({"message": "Login successful"}), 200
    
    return jsonify({"message": "Wrong email or password"}), 401





if __name__ == '__main__':
    with app.app_context():
        db.create_all()

    app.run(debug=True)
    
