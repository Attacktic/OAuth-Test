var knex = require('../db/knex');

module.exports = {
  localUserProfile : function(id){
    return knex.raw(`select * from users where id =${id}`);
  },
  FBUserProfile : function(facebook_key){
    return knex.raw(`select users.id as id, users.email as email, users.name as name from users join fbusers on fbusers.id = users.facebook_id where fbusers.facebook_key='${facebook_key}'`);
  },
  GoogleUserProfile : function(google_key){
    return knex.raw(`select * from users join googleusers on googleusers.id = users.google_id where googleusers.google_key=${google_key}`);
  },
  createLocalUser : function(form){
    return knex.raw(`insert into users (name, password, email) values('${form.name}', '${form.password}', '${form.email}');`)
  },
  createFBUser : function(key){
    return knex.raw(`insert into fbusers values(default,'${key}')`)
  },
  createGoogleUser : function(google){
    return knex.raw(`insert into fbusers values(default,'${google.key}')`)
  },
  createLocalUserFB : function(name, email, fbid){
    return knex.raw(`insert into users (name, facebook_id, email) values('${name}', '${fbid}', '${email}');`)
  },
  createLocalUserGoogle : function(google, googleid){
    return knex.raw(`insert into users (name, age, email, google_id) values('${google.name}', ${google.age}, '${google.email}', ${googleid});`)
  },
  findFBid : function(facebook_key){
    return knex.raw(`select id from fbusers where facebook_key='${facebook_key}'`);
  },
  findGoogleid : function(google_key){
    return knex.raw(`select id from googleusers where google_key=${google_key}`);
  },
  findIdbyEmail: function(email){
    return knex.raw(`select id from users where email='${email}'`);
  },
  connectFBAccount: function(email, facebook_key){
    return knex.raw(`update users set facebook_id=${facebook_key} where email='${email}'`);
  }
};
