'use strict';

import { NoSQLClient } from 'oracle-nosqldb';
import { Region } from 'oracle-nosqldb';
const TABLE_NAME = 'HelloWorldTable';
/**
  * Call the main function for this example
  **/
doHelloWorld();

/** This function will authenticate with the cloud service,
  * create a table, write a record to the table, then read that record back
  **/
async function doHelloWorld() {
	let handle;
    try {
        /* replace the placeholder of the region with the name of your region , for example Region.US_ASHBURN_1*/
        handle = getConnection(Region.US_SANJOSE_1); //getConnection is synchronous.
        await createTable(handle);
        await writeARecord(handle, {
            employeeid : 1,
            name : 'ThinkOCI'
            }
        );

        console.log("Wrote a record with primary key 1")
        let theRecord = await readARecord(handle, 1);
        console.log('Successfully read the record: ' + JSON.stringify(theRecord.row));
        //await dropTable(handle);
    } catch (error ) {
        console.log(error);
        process.exit(-1);
    }
	finally {
		if (handle) {
			handle.close();
		}
	}
}

/**
  * Create and return an instance of a NoSQLCLient object. NOTE that
  * you need to fill in your cloud credentials and the compartment
  * where you want your table created. Compartments can be dot seperated
  * paths.  For example: developers.dave.
  *
  * @param {Region} which Region An element in the Region enumeration
  * indicating the cloud region you wish to connect to
  */
// replace the placeholder for compartment with the OCID of your compartment. 
function getConnection(whichRegion) {

    return new NoSQLClient({
       region: whichRegion,
       compartment: "ocid1.compartment.oc1..aaaaaaaadrngvea2t7sbjnp5zy4c2ihloi7amf5iiuwq", 
	   auth: {
			iam: {
					useInstancePrincipal: true
				}
			}
    });
}

/**
  * This function will create the HelloWorldTable table with two columns,
  * one integer column which will be the primary key and one string which will be the name.
  *
  * @param {NoSQLClient} handle An instance of NoSQLClient
  */
/* Return the resulting promise. */
function createTable(handle) {
    const createDDL = `CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (employeeid INTEGER, name STRING, PRIMARY KEY(employeeid))`;
    console.log('Create table: ' + createDDL);

	return handle.tableDDL(createDDL, {
		complete: true,
		tableLimits: {
			readUnits: 1,
			writeUnits: 1,
			storageGB: 1
		}
	});
}

/**
  * Writes a single record to the HelloWorldTable table
  *
  * @param {NoSQLClient} handle an instance of NoSQLClient
  * @param {Object} record A JSON object representing
  * record to write to HelloWorldTable.
  */
/* Return the resulting promise. */
function writeARecord(handle, record) {
    return handle.put(TABLE_NAME, record);
}

/**
  * Reads and returns a record from the HelloWorldTable table
  *
  * @param {NoSQLClient} handle an instance of NoSQLClient
  * @param {number} pk The primary key of the record to retrieve
  */
/* Return the resulting promise. */
function readARecord(handle, pk) {
    return handle.get(TABLE_NAME, {
        'employeeid' : pk
    })
}

/* Return the resulting promise. */
function dropTable(handle) {
    const dropDDL = `DROP TABLE HelloWorldTable`;
    console.log('Drop table: ' + dropDDL);

	return handle.tableDDL(dropDDL, {
		complete: true });
}
