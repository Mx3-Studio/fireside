(function() {
  "use strict";

  angular.module('app.svc')

  .service('FirebaseAuth', ['FirebaseRef', '$firebaseAuth', '$location', FirebaseAuthService]);

  function FirebaseAuthService(FirebaseRef, $firebaseAuth, $location) {
    return angular.merge($firebaseAuth(), {
      authenticate: authenticate,
      logout: logout
    });

    /**
     * Authenticate a user with the specified credentials.
     * @param credentials app.Credentials
     * @return Promise
     */
    function authenticate(credentials) {
      return $firebaseAuth()
        .$signInWithPopup("google")
        .then(function(userCredential) {
          return processUserCredential(userCredential);
        });
    }

    /**
     * Performs a Firebase logout and returns a promise.
     * @return Promise
     */
    function logout() {
      // Signout with Firebase and return the promise
      return $firebaseAuth().$signOut().then(function() {
        $location.url('/login');
      }).catch(function(error) {
        $location.url('/login');
      });
    }

    /**
     * Performs the necessary tasks on the firebase.UserCredential object
     * returned by Firebase and returns a clean UserAuth object.
     * @param userCredential firebase.UserCredential
     * @return app.UserAuth
     * @private
     */
    function processUserCredential(userCredential) {
      var userProfile = {
        uid: userCredential.user.uid,
        displayName: userCredential.user.displayName,
        email: userCredential.user.email,
        photoURL: userCredential.user.photoURL,
      };
      saveProfile(userProfile, userCredential.credential.provider);
      // Return User Auth object as the result of this
      return {
        token: userCredential.credential.accessToken,
        profile: userProfile,
        provider: userCredential.credential.provider,
        uid: userProfile.uid
      };
    }

    /**
     * Store the UserProfile into Firebase.
     * @param userProfile app.UserProfile
     * @param provider the latest authentication provider
     * @return Promise
     */
    function saveProfile(userProfile, provider) {
      // Create a Profile starting with the User
      var profile = angular.copy(userProfile);

      // Replace the current Profile with the new Profile
      // Replace profile in profiles
      var updates = {};
      updates['/users/' + profile.uid + '/profile'] = profile;
      updates['/profiles/' + profile.uid] = profile;
      return FirebaseRef.db.update(updates);
    }

  }

}());
