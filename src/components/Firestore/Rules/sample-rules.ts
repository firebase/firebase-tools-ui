export const sampleRules: string = `

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    //////////////////////////////////////////////////////////////
    //                    USERS COLLECTION
    //////////////////////////////////////////////////////////////
    match /users/{userId} {
    	allow read: if isSignedIn() && userOwnsDocument(userId);
      allow create: if isSignedIn();
      allow update: if false; // there are currently no WRITEs to users documents
      allow delete: if false; // there are currently no WRITEs to users documents
    }
    //////////////////////////////////////////////////////////////
    //                    RECIPES COLLECTION
    //////////////////////////////////////////////////////////////
    match /recipes/{recipeId} {
    	allow read: if true; // everyone can read
      allow create: if isSignedIn();
      allow update: if isSignedIn() && userOwnsDocument(getIncomingData().authorId);
      allow delete: if isSignedIn() && userOwnsDocument(getExistingData().authorId);


        //////////////////////////////////////////////////////////////
        //                   REVIEWS SUB-COLLECTION
        //////////////////////////////////////////////////////////////
        match /reviews/{reviewId} {
          allow read: if true; // everyone can read
          allow create: if isSignedIn();
          allow update: if isSignedIn() && userOwnsDocument(getIncomingData().authorId);
          allow delete: if isSignedIn() && userOwnsDocument(getExistingData().authorId);
        }
        //////////////////////////////////////////////////////////////
        //                 INGREDIENTS SUB-COLLECTION
        //////////////////////////////////////////////////////////////
        match /ingredients/{ingredientId} {
          allow read: if true; // everyone can read
          allow create: if isSignedIn() && userOwnsRecipe() && wasDocumentCreatedThroughBatchWrite(ingredientId);
          allow update: if false; // no current way of updating ingredients
          allow delete: if isSignedIn() && userOwnsRecipe();
        }
        function getRecipeAuthorId() {
          return get(/databases/$(database)/documents/recipes/$(recipeId)).data.authorId;
        }
        function userOwnsRecipe() {
          return request.auth.uid == getRecipeAuthorId();
        }
        function wasDocumentCreatedThroughBatchWrite(ingredientId) {
          return getAfter(/databases/$(database)/documents/recipes/$(recipeId)/ingredients/$(ingredientId)).data.createdAt == request.time;
        }
    }
    //////////////////////////////////////////////////////////////
    //                      DEFAULT CASE
    //////////////////////////////////////////////////////////////
    // match /{document=**} {
    //   allow read, write: if false; // every non-considered case is blocked
    // }    
    
    //////////////////////////////////////////////////////////////
    //                       FUNCTIONS
    //////////////////////////////////////////////////////////////

    function isSignedIn() {
    	return request.auth != null;
    }
    // provide the potential authorId
    function userOwnsDocument(authorId) {
    	return request.auth.uid == authorId
    }

// User intents to write this data in to the database
// This Data content fields are accesable (data.creationDate)
    function getIncomingData() {
    	return request.resource.data
    }   
// This Data is already saved in the database
    function getExistingData() {
    	return resource.data
    }    

    // function isExistingDataLocked() {
    // 	return getExistingData().locked
    // }    
    // function getUserData() {
    //   return get(/databases/$(database)/documents/users/$(request.auth.uid)).data
    // }  
    // function hasVerifiedEmail() {
    // 	return request.auth.token.email_verified;
    // }            

  }
}



// const arr = []    // example
// arr.keys()  -> access keys of dictionary as an array
// arr.hasAny(['admin', 'editor'])  ->  has any of this values?
// arr.hasAll(['admin', 'editor'])  -> has all this values?

// request.time()    ->   time when this request was made
// getExistingData().createdAt     ->    time when existing data was added to database
`;
