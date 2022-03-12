"use strict";

const Hapi = require("@hapi/hapi");
const path = require("path");
const Connection=require('./dbconfig');
const users=require('./models/users');
 

const init = async () => {
  const server = Hapi.Server({
    host: "localhost",
    port: 8080,
    routes: {
      files: {
        relativeTo: path.join(__dirname, "static"),
      },
    },
  });

  await server.register([
    {
      plugin: require("hapi-geo-locate"),
      options: {
        enabledByDefault: true,
      },
    },
    {
      plugin: require("@hapi/inert"),
    },
    {
        plugin:require('@hapi/vision')
    },
  ]);

  server.views({
      engines:{
          html:require('handlebars')
      },
      path:path.join(__dirname,'dynamic'),
      layout:'default',
  })

  server.route([
    {
      method: "GET",
      path: "/",
      handler: (req, res) => {
        return res.file("welcome.html");
      },
    },
    {
        method:"GET",
        path:"/dynamic",
        handler:(req,res)=>{
            const data={
                name:"Farhan"
            }
            return res.view('index',data);
        }
    },
    {
        method:'POST',
        path:'/login',
        handler:(req,res)=>{
          users.createUser(req.payload.username,req.payload.password)
            return res.view('login',{username:req.payload.username})
        }
    },
    {
      method:"GET",
      path:'/getusers',
      handler:async (req,res)=>{
        const users=await Connection.getUsers();
        return res.view('index',{users});
      }
    },
    {
      method: "GET",
      path: "/users",
      handler: (req, h) => {
        return "users page";
      },
    },
    {
      method: "GET",
      path: "/location",
      handler: (req, h) => {
        if (req.location) {
          return req.location;
        } else {
          return "You are not enabled by default";
        }
      },
    },
    {
      method: "GET",
      path: "/download",
      handler: (req, res) => {
        return res.file("welcome.html", {
          mode: "inline",
          filename: "welcome-download.html",
        });
      },
    },
    {
      method: "GET",
      path: "/{any*}",
      handler: (req, res) => {
        return "There is no such page";
      },
    },
  ]);

  await server.start();
  console.log(`server started at ${server.info.uri}`);
};

process.on("unhandledRejection", (err) => {
  console.log(err);
  process.exit(1);
});
init();
