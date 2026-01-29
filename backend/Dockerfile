FROM python:3.11-slim 

WORKDIR /app

COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY . /app

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host=0.0.0.0", "--port=8000", "--reload"]

# FROM python:3.11-slim → start with a machine that has Python

# WORKDIR /app → go into /app folder inside container

# COPY requirements.txt... → bring dependency list into container

# RUN pip install... → install dependencies

 # COPY . /app → bring your backend code into container

# CMD ... → start FastAPI server