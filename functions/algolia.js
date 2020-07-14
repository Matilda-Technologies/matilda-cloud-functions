/* eslint-disable promise/always-return */
/* eslint-disable promise/catch-or-return */

// For the default version
const algoliasearch = require('algoliasearch');

// // For the default version
// import algoliasearch from 'algoliasearch';

// // For the search only version
// import algoliasearch from 'algoliasearch/lite';

const client = algoliasearch('G73TYY8FPW', '91a82c885df14b5fc9bdc099c0c45ac2');

// const index = client.initIndex('your_index_name');

const index = client.initIndex('contacts');
// const contactsJSON = require('./algolia/contacts.json');

// index.saveObjects(contactsJSON, {
//   autoGenerateObjectIDIfNotExist: true
// }).then(objectIDs => {
//   console.log(objectIDs);
//   return objectIDs
// });

// index.setSettings({
//   searchableAttributes: [
//     'lastname',
//     'firstname',
//     'company',
//     'email',
//     'city',
//     'address'
//   ]
// })


// Search for a first name
index.search('jimmie').then(({ hits }) => {
  console.log(hits);
});

// // Search for a first name with typo
// index.search('jimie').then(({ hits }) => {
//   console.log(hits);
// });

// // Search for a company
// index.search('california paint').then(({ hits }) => {
//   console.log(hits);
// });

// // Search for a first name and a company
// index.search('jimmie paint').then(({ hits }) => {
//   console.log(hits);
// });