{\rtf1\ansi\ansicpg1252\cocoartf2639
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fmodern\fcharset0 Courier;}
{\colortbl;\red255\green255\blue255;\red19\green19\blue20;\red255\green255\blue255;}
{\*\expandedcolortbl;;\cssrgb\c9412\c9412\c10196;\cssrgb\c100000\c100000\c100000;}
\margl1440\margr1440\vieww11520\viewh9720\viewkind0
\deftab720
\pard\pardeftab720\partightenfactor0

\f0\fs28 \cf2 \cb3 \expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 const \{ MongoClient \} = require('mongodb');\
\
const client = new MongoClient(process.env.MONGODB_URI);\
\
// Test the connection\
client.connect()\
  .then(() => console.log("Connected:", client.db().databaseName))\
  .catch(err => console.error("Connection error:", err));\
\
\pard\tx5652\pardeftab720\partightenfactor0
\cf2 module.exports = client;}