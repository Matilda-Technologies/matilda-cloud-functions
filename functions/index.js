const functions = require('firebase-functions');


const cors = require('cors')({
  origin: true
});
const admin = require('firebase-admin');
const serviceAccount = require('./service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://mia-test-sgwxam.firebaseio.com"
});

const db = admin.firestore()


const {
  SessionsClient
} = require('dialogflow');

exports.dialogflowGateway = functions.https.onRequest((request, response) => {
  cors(request, response, async () => {
    const {
      queryInput,
      sessionId
    } = request.body;


    const sessionClient = new SessionsClient({
      credentials: serviceAccount
    });
    const session = sessionClient.sessionPath('mia-test-sgwxam', sessionId);


    const responses = await sessionClient.detectIntent({
      session,
      queryInput
    });

    const result = responses[0].queryResult;

    response.send(result);

  });
});

const {
  WebhookClient
} = require('dialogflow-fulfillment');

exports.dialogflowWebhook = functions.https.onRequest(async (request, response) => {
  const agent = new WebhookClient({
    request,
    response
  });

  const result = request.body.queryResult;


  async function userOnboardingHandler(agent) {

    // Do backend stuff here
    const db = admin.firestore();
    // STORE USER_ID HERE TO UPDATE DB BASED ON USER
    const profile = db.collection('users').doc('it3gcWfiUOcAS2K1g7ciiP7aSXw1');

    const {
      firstname,
      lastname,
      age
    } = result.parameters;

    await profile.set({
      firstname,
      lastname,
      age
    })
    agent.add('Welcome aboard my friend!');
  }


  let intentMap = new Map();
  intentMap.set('UserOnboarding', userOnboardingHandler);
  agent.handleRequest(intentMap);
});


//Firestore trigger, Creating user information in user-infos

exports.createUser = functions.firestore
  .document('users/{userId}')
  .onCreate((snap, context) => {
    // Get an object representing the document
    // e.g. {'name': 'Marie', 'age': 66}
    const newValue = snap.data();

    db.collection('user-infos').doc(context.params.userId).set(newValue)

  });

//Firestore trigger, updating user information in user-infos
exports.updateUser = functions.firestore
  .document('users/{userId}')
  .onUpdate((change, context) => {
    // Get an object representing the document
    // e.g. {'name': 'Marie', 'age': 66}
    const newValue = change.after.data();

    // ...or the previous value before this update
    //const previousValue = change.before.data();

    db.collection('user-infos').doc(context.params.userId).set(newValue, {
      merge: true
    })


  });


exports.createOrgId = functions.firestore
  .document("organizations/{orgId}")
  .onCreate((snap, context) => {
    // Get an object representing the document
    // e.g. {'name': 'Marie', 'age': 66}
    db.collection('organizations').doc(context.params.orgId).set({
      orgId: context.params.orgId
    }, {
      merge: true
    })

  });


//Create JobId within the document, update the conversation card with a new job
exports.createJobId = functions.firestore
  .document("jobs/{jobId}")
  .onCreate((snap, context) => {
    // Get an object representing the document
    // e.g. {'name': 'Marie', 'age': 66}
    db.collection('jobs').doc(context.params.jobId).set({
      jobId: context.params.jobId
    }, {
      merge: true
    });
  });

  exports.scheduledExpiredJobCheck = functions.pubsub.schedule('5 11 * * *')
  .timeZone('America/New_York') // Users can choose timezone - default is America/Los_Angeles
  .onRun((context) => {
    var beginningDate = Date.now() - 604800000;
    var beginningDateObject = new Date(beginningDate);

    const snapshot = db.collection("jobs").where('advertisedUntil', '<', beginningDateObject).get();
    if (snapshot.empty) {
      console.log('No matching documents.');
      return;
    }
    snapshot.forEach(doc => {
      const res = db.collection("jobs").doc(doc.id).delete();
      console.log(res)
    });

  console.log('This will be run every day at 11:05 AM Eastern!');
});



//TODO: Check if this is really necessary
exports.updateConversationCards = functions.firestore
  .document("jobs/{jobId}")
  .onWrite((change, context) => {
    // Get an object representing the document
    let jobData = change.after.data()

    db.collection('conversation-cards').doc(context.params.jobId).set({
      jobId: context.params.jobId,
      jobTitle: jobData.jobTitle,
      location: jobData.location,
      orgId: jobData.orgId,

    }, {
      merge: true
    })
  });

//TODO: Function for updating the cards, seeing the latest information.
