# Import the dependencies.
import numpy as np
import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, func
from flask import Flask, jsonify
import datetime as dt
import sqlite3
import os
import pandas as pd
from sqlalchemy import inspect
from flask_cors import CORS

#################################################
# Database Setup
#################################################

# List of folders containing the CSV files
folders = ['../../Grp-Project-3/Project3_Group2/Resources/arefin_data', 
           '../../Grp-Project-3/Project3_Group2/Resources/ellis_data', 
           '../../Grp-Project-3/Project3_Group2/Resources/rita_data', 
           '../../Grp-Project-3/Project3_Group2/Resources/uwagboe_data']
print(folders)
# Connect to SQLite database (this will create the file if it doesn't exist)
conn = sqlite3.connect('stockdata.sqlite')

for folder in folders:
    for file in os.listdir(folder):
        if file.endswith('.csv'):
            # Read CSV file into DataFrame
            df = pd.read_csv(os.path.join(folder, file))
            
            # Check if 'id' column exists, if not create it
            if 'id' not in df.columns:
                df.insert(0, 'id', range(1, 1 + len(df)))
            
            # Use the filename (without .csv) as the table name
            table_name = os.path.splitext(file)[0]
            
            # Convert DataFrame to SQL table in SQLite database
            df.to_sql(table_name, conn, if_exists='replace', index=False)

# Close the connection
conn.close()

# engine = create_engine("sqlite:///stockdata.sqlite")
    # # Use the inspector to get the table names
    # inspector = inspect(engine)
    # table_names = inspector.get_table_names()

    # print(table_names)

#################################################
# Flask Setup
#################################################
app = Flask(__name__)
CORS(app)

#################################################
# Flask Routes
#################################################
# This is the implementation of the homepage
@app.route("/")
def homepage():
    """List all available api routes."""
    return (
        f"Available Routes:<br/>"
        f"/api/v1.0/fetch_data<br/>"        
    )

# Implementing start date
@app.route("/api/v1.0/fetch_data")
def Fetch_Data():
    
    # Query data into a DataFrame by starting with the main comprehensive list 'S&P500companies'
    conn = sqlite3.connect("stockdata.sqlite")
    df = pd.read_sql_query("SELECT * FROM [S&P500companies]", conn)
    # print(df.head())

    # Rename some columns
    df = df.rename(columns={'Symbol':'Ticker','Security':'Company','GICS Sub-Industry': 'Sub_sector', 'Headquarters Location': 'Headquarters'})
    # Rename some columns
    df = df.rename(columns={'Symbol':'Ticker','Security':'Company','GICS Sub-Industry': 'Sub_sector', 'Headquarters Location': 'Headquarters'})
    # print(df.head())

    # Delete some columns 
    df = df.drop(columns=['GICS Sector', 'CIK'])
    # Show what's the current state of the df
    # print(df.head())

    # Construct the dictionaries
    metadata = df.to_dict(orient='records')

    #5 Acquire the Records
    set0 = pd.read_sql_query("SELECT * FROM AAPL", conn) 
    set1 = pd.read_sql_query("SELECT * FROM AMZN", conn) 
    set2 = pd.read_sql_query("SELECT * FROM GOOGL", conn)
    set3 = pd.read_sql_query("SELECT * FROM META", conn) 
    set4 = pd.read_sql_query("SELECT * FROM MSFT", conn) 
    set5 = pd.read_sql_query("SELECT * FROM NDVA", conn) 
    set6 = pd.read_sql_query("SELECT * FROM TSLA", conn) 
    #------------
    set7 = pd.read_sql_query("SELECT * FROM DXC", conn) 
    set8 = pd.read_sql_query("SELECT * FROM FFIV", conn)
    set9 = pd.read_sql_query("SELECT * FROM JNPR", conn)
    set10 = pd.read_sql_query("SELECT * FROM QRVO", conn)
    set11 = pd.read_sql_query("SELECT * FROM SEDG", conn)
    #------------
    set12 = pd.read_sql_query("SELECT * FROM ANSS", conn)
    set13 = pd.read_sql_query("SELECT * FROM GE", conn) 
    set14 = pd.read_sql_query("SELECT * FROM HPE", conn)
    set15 = pd.read_sql_query("SELECT * FROM KEYS", conn)
    set16 = pd.read_sql_query("SELECT * FROM MTD", conn) 
    set17 = pd.read_sql_query("SELECT * FROM ZBH", conn) 

    # df_sets = ["set" + str(i) for i in range(18)]
    df_sets = [set0,set1,set2,set3,set4,set5,set6,set7,set8,set9,set10,set11,set12,set13,set14,set15,set16,set17]

    tickers = ["AAPL","AMZN","GOOGL","META","MSFT","NVDA","TSLA","DXC","FFIV","JNPR","QRVO","SEDG","ANSS","GE","HPE","KEYS","MTD","ZBH"] # df["Ticker"].tolist()

    stock_records = []
    for cdf, ts in zip(df_sets, tickers):
        company_record={
            "ticker":ts,
            "dates": cdf["Date"].tolist(), #(globals()[cdf])["Date"].tolist(),
            "open": cdf["Open"].tolist(), #(globals()[cdf])["Open"].tolist(),
            "high": cdf["High"].tolist(), #(globals()[cdf])["High"].tolist(),
            "low": cdf["Low"].tolist(), #(globals()[cdf])["Low"].tolist(),
            "close": cdf["Close"].tolist(), #(globals()[cdf])["Close"].tolist(),
            "adj close": cdf["Adj Close"].tolist(), #(globals()[cdf])["Adj Close"].tolist(),
            "volume": cdf["Volume"].tolist() #(globals()[cdf])["Volume"].tolist()
        }
        stock_records.append(company_record)

    final_dataset = {"tickers":tickers,
                    "company_info":metadata,
                    "stock_history": stock_records,
                    }
    # print(final_dataset)
    # Return the JSON representation of the final_dataset
    conn.close()
    return jsonify(final_dataset)


if __name__ == '__main__':
    app.run(debug=True)
