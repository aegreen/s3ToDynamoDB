'use strict';

const AWS = require('aws-sdk')
const s3 = new AWS.S3()

const docClient = new AWS.DynamoDB.DocumentClient()
const { v4: uuidv4 } = require('uuid')
const dynamoTable = process.env.dynamoDBFrenchWordsTable
const s3Bucket = process.env.s3FrenchWordsBucket

module.exports.copyToDynamoDB = async event => {
  console.log('Using table ', dynamoTable)
  console.log('Using bucket ', s3Bucket)
  try {
    // Get the file in the S3 bucket
    const wordListFileDetail = await s3.listObjects({
      Bucket: s3Bucket,
      MaxKeys: 1
    }).promise()

    const wordListFileData = await s3.getObject({
      Bucket: s3Bucket,
      Key: wordListFileDetail.Contents[0].Key
    }).promise()

    // Upload JSON to DynamoDB
    const jsonData = JSON.parse(wordListFileData.Body.toString('utf-8'))
    await writeToDynamoDB(jsonData)
  } catch (err) {
    console.error(err)
  }
};

const writeToDynamoDB = async (data) => {
  let batches = []
  const BATCH_SIZE = 25

  while (data.length > 0) {
    batches.push(data.splice(0, BATCH_SIZE))
  }

  let batchCount = 0

  await Promise.all(
    batches.map(async (item_data) => {

      // Set up params for batch call
      const dynamoDBParams = {
        RequestItems: {}
      }
      dynamoDBParams.RequestItems[dynamoTable] = []

      item_data.forEach(item => {
        for (let key of Object.keys(item)) {
          // An AttributeValue may not contain an empty string
          if (item[key] === '') {
            delete item[key]
          }
        }

        // Build params
        dynamoDBParams.RequestItems[dynamoTable].push({
          PutRequest: {
            Item: {
              ID: uuidv4(),
              ...item
            }
          }
        })
      })

      // Get the file name from the bucket
      try {
        batchCount++
        const writtenData = await docClient.batchWrite(dynamoDBParams).promise()
        console.log('Success: ', writtenData)
      } catch (err) {
        console.error('Error: ', err)
      }
    })
  )
  
}