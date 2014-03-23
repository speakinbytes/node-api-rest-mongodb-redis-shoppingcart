module.exports = function(app) {

  var Tshirt = require('../models/tshirt.js');
  var WasHot = require('../models/washot.js');
  var redis  = require("redis"),
      client = redis.createClient();
  var ttl    = 60;

  //GET - Return all tshirts in the DB
  findAllTshirts = function(req, res) {
    console.log("GET - /tshirts");
  	Tshirt.find(function(err, tshirts) {
      if (tshirts.length == 0) {
        console.log("No find tshirts");
        res.statusCode = 404;
        return res.send("No find tshirts");
      }
  		if(!err) {
  			res.send(tshirts);
  		} else {
        res.statusCode = 500;
  			console.log('Internal error(%d): %s',res.statusCode,err.message);
        res.send({ error: 'Server error' });
  		}
  	});
  };

  //GET - Return a Tshirt with specified ID
  // Add a key into redis BD
  findById = function(req, res) {
    console.log("GET - /tshirt/:id");
    return Tshirt.findById(req.params.id, function(err, tshirt) {
      if(!tshirt) {
        res.statusCode = 404;
        return res.send({ error: 'Not found' });
      }
      if(!err) {
        // Guardamos el what's hot en redis
        // Comprobamos si la clave existía o no existía
        client.get("hot."+req.params.id, function(err, instance){
          if (!instance) {
            // Si no existía, creamos una nueva clave con valor inicial 1.
            // Añadiendo el "EX", ttl indicamos el tiempo de expiración.
            client.set ("hot."+req.params.id, 1, "EX", ttl, function(error, result) {
              if (error) console.log('Error: ' + error);
              else {
                console.log('Instance saved!');
              }
            });
          }
          else {
            // Si existía, incrementamos su valor en 1.
            client.incr("hot."+req.params.id, function(error, inst){
              if (error) console.log('Error: ' + error);
              else console.log('Instance incremented!');
            });
            // Reiniciamos el tiempo de expiración.
            client.expire("hot."+req.params.id, ttl, function(error){
              if (error) console.log('Error: ' + error);
              else console.log('Instance expire time restaured!');
            });
          }
        });

        // Guardamos el what's was hot en Mongo
        var washot = new WasHot({
          tshirt_id : req.params.id
        });
        washot.save(function(err) {
          if(!err) {
            console.log("WasHot created");
          } 
          else {
            console.log('Internal error(%d): %s',res.statusCode,err.message);
            res.statusCode = 500;
            res.send('Internal error(%d): %s',res.statusCode,err.message);
          }            
        });
        
        res.send({ status: 'OK', tshirt:tshirt });
      } else {
        res.statusCode = 500;
        console.log('Internal error(%d): %s',res.statusCode,err.message);
        res.send({ error: 'Server error' });
      }
    });
  };

  //POST - Insert a new Tshirt in the DB
  addTshirt = function(req, res) {
    console.log('POST - /tshirt');
    console.log(req.body);

    var tshirt = new Tshirt({
      model:    req.body.model,
      images :  req.body.images, 
      style:    req.body.style,
      size :    req.body.size, 
      colour:   req.body.colour, 
      price:    req.body.price,
      summary:  req.body.summary  
    });

    tshirt.save(function(err) {
      if(!err) {
        console.log("Tshirt created");
        res.send({ status: 'OK', tshirt:tshirt });
      } else {
        console.log(err);
        if(err.name == 'ValidationError') {
          res.statusCode = 400;
          res.send({ error: 'Validation error' });
        } else {
          res.statusCode = 500;
          res.send({ error: 'Server error' });
        }
        console.log('Internal error(%d): %s',res.statusCode,err.message);
      }
    });
  };

  //PUT - Update a register already exists
  updateTshirt = function(req, res) {
    console.log("PUT - /tshirt/:id");
    console.log(req.body);
    return Tshirt.findById(req.params.id, function(err, tshirt) {
      if(!tshirt) {
        res.statusCode = 404;
        return res.send({ error: 'Not found' });
      }

      if (req.body.model != null) tshirt.model = req.body.model;
      if (req.body.price != null) tshirt.price = req.body.price;
      if (req.body.images != null) tshirt.images = req.body.images; 
      if (req.body.style != null) tshirt.style = req.body.style;
      if (req.body.size != null) tshirt.size  = req.body.size;
      if (req.body.colour != null) tshirt.colour = req.body.colour;
      if (req.body.summary != null) tshirt.summary = req.body.summary;

      tshirt.save(function(err) {
        if(!err) {
          console.log('Updated');
          res.send({ status: 'OK', tshirt:tshirt });
        } else {
          if(err.name == 'ValidationError') {
            res.statusCode = 400;
            res.send({ error: 'Validation error' });
          } else {
            res.statusCode = 500;
            res.send({ error: 'Server error' });
          }
          console.log('Internal error(%d): %s',res.statusCode,err.message);
        }
      });
    });
  }

  //DELETE - Delete a Tshirt with specified ID
  deleteTshirt = function(req, res) {
    console.log("DELETE - /tshirt/:id");
    return Tshirt.findById(req.params.id, function(err, tshirt) {
      if(!tshirt) {
        res.statusCode = 404;
        return res.send({ error: 'Not found' });
      }

      tshirt.remove(function(err) {
        if(!err) {
          console.log('Removed tshirt');
          res.send({ status: 'OK' });
        } else {
          res.statusCode = 500;
          console.log('Internal error(%d): %s',res.statusCode,err.message);
          res.send({ error: 'Server error' });
        }
      })
    });
  }

  hot = function(req, res){
    console.log("GET - /hots");

    client.keys("hot.*", function (err, replies){
      if (replies.length == 0) {
        res.statusCode = 404;
        return res.send({ error: 'Not hot tshirts now' });
      } 
      if (!err) {
        async = require("async");
 
        // Array to hold async tasks
        var asyncTasks = [];
        var hotTshirts = [];
         
        // Loop through some items
        replies.forEach(function(item){
          // We don't actually execute the async thing here
          // We push a function containing it on to an array of "tasks"
          asyncTasks.push(function(callback){
            // Call an async function (often a save() to MongoDB)
            Tshirt.findById(item.substring(4), function (err, tshirt){
                if (err) {
                  console.log("Hot Tshirt Not Found");
                  res.statusCode = 500;
                  console.log('Internal error(%d): %s',res.statusCode,err.message);
                  return res.send({ error: 'Server error' });
                }
                else {
                  hotTshirts.push(tshirt);
                  console.log("hotTshirts add");
                }
              });
              // Async call is done, alert via callback
              callback();
            });
          });
        
         
        // Note: At this point, nothing has been executed,
        // we just pushed all the async tasks into an array
         
        // To move beyond the iteration example, let's add
        // another (different) async task for proof of concept
        asyncTasks.push(function(callback){
          // Set a timeout for 3 seconds
          setTimeout(function(){
            // It's been 0.5 seconds, alert via callback
            callback();
          }, 500);
        });
         
        // Now we have an array of functions, each containing an async task
        // Execute all async tasks in the asyncTasks array
        async.parallel(asyncTasks, function(){
          // All tasks are done now
          //doSomethingOnceAllAreDone();
          console.log(hotTshirts);
          res.send(hotTshirts);
        });

      } 
      else {
        res.statusCode = 500;
        console.log('Internal error(%d): %s',res.statusCode,err.message);
        res.send({ error: 'Server error' });
      }
    });
  }

  washot = function(req, res) {
    console.log("GET - /washot");
    var date = new Date();
    if (((req.params.monthstart < 1) || (req.params.monthstart > 12)) || ((req.params.monthend < 1) || (req.params.monthend > 12)))
    {
      console.log("Incorrect month");
      res.statusCode = 404;
      return res.send("Incorrect month");
    }    
    if (((req.params.daystart < 1) || (req.params.daystart > 31)) || ((req.params.dayend < 1) || (req.params.dayend > 31)))
    {
      console.log("Incorrect day");
      res.statusCode = 404;
      return res.send("Incorrect day");
    }
    if (((req.params.monthstart == 4) || (req.params.monthstart == 6) || (req.params.monthstart == 9) || (req.params.monthstart == 11)) 
         && (req.params.daystart > 30))
    {
      console.log("Incorrect day");
      res.statusCode = 404;
      return res.send("Incorrect day");
    }
    if (((req.params.monthend == 4) || (req.params.monthend == 6) || (req.params.monthend == 9) || (req.params.monthend == 11)) 
         && (req.params.dayend > 30))
    {
      console.log("Incorrect day");
      res.statusCode = 404;
      return res.send("Incorrect day");
    }
    if((req.params.monthstart == 2) && 
       (((req.params.yearstart % 400) == 0) || ((req.params.yearstart % 4) == 0)) && ((req.params.yearstart % 100) != 0) 
       && (req.params.daystart > 29))
    {
      console.log("Incorrect day");
      res.statusCode = 404;
      return res.send("Incorrect day");
    }
    if((req.params.monthend == 2) && 
       (((req.params.yearend % 400) == 0) || ((req.params.yearend % 4) == 0)) && ((req.params.yearend % 100) != 0) 
       && (req.params.dayend > 29))
    {
      console.log("Incorrect day");
      res.statusCode = 404;
      return res.send("Incorrect day");
    }
    if((req.params.monthstart == 2) && ((req.params.yearstart % 100) == 0) && (req.params.daystart > 29)){
      console.log("Incorrect day");
      res.statusCode = 404;
      return res.send("Incorrect day");
    }
    if((req.params.monthend == 2) && ((req.params.yearend % 100) == 0) && (req.params.dayend > 29)){
      console.log("Incorrect day");
      res.statusCode = 404;
      return res.send("Incorrect day");
    }
    if ((req.params.yearstart < 2000) || (req.params.yearend < 2000)) {
      console.log("Year should be bigger than 2000");
      res.statusCode = 404;
      return res.send("Year should be bigger than 2000");
    }
    if (req.params.yearend < req.params.yearstart) {
      console.log("Year end shouldn't be smaller than year start");
      res.statusCode = 404;
      return res.send("Year end shouldn't be smaller than year start");
    } 
    else if ((req.params.yearstart == req.params.yearend) && (req.params.monthend < req.params.monthstart)) {
      console.log("Month end shouldn't be smaller than month start");
      res.statusCode = 404;
      return res.send("Month end shouldn't be smaller than month start");
    }
    else if ((req.params.monthstart == req.params.monthend) && (req.params.dayend < req.params.daystart)) {
      console.log("Day end shouldn't be smaller than day start");
      res.statusCode = 404;
      return res.send("Day end shouldn't be smaller than day start");
    }

    var dateStart = new Date(req.params.yearstart, req.params.monthstart, req.params.daystart);
    var dateEnd = new Date(req.params.yearend, req.params.monthend, req.params.dayend);

    WasHot.find({created : {"$gte" : dateStart, "$lt" : dateEnd }}, function (err, washots) {
      if (washots.length == 0) {
        console.log("No find washots");
        res.statusCode = 404;
        return res.send("No find washots");
      }
      if(!err) {
        res.send(washots);
      } else {
        res.statusCode = 500;
        console.log('Internal error(%d): %s',res.statusCode,err.message);
        res.send({ error: 'Server error' });
      }
    });
  };

  //Link routes and functions
  app.get('/tshirts', findAllTshirts);
  app.get('/tshirt/:id', findById);
  app.post('/tshirt', addTshirt);
  app.put('/tshirt/:id', updateTshirt);
  app.delete('/tshirt/:id', deleteTshirt);
  app.get('/hots', hot);
  app.get('/washot/:yearstart/:monthstart/:daystart/:yearend/:monthend/:dayend', washot);
}


