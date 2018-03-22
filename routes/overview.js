'use strict';

let application = require('../application');
let helpers = require('../helpers');
let express = require('express');
let router = express.Router();
let request = require('request');
let vsts = require('vso-node-api');


router.post('/byUser', (req, res) => {
    if(req.body.authToken && req.body.user) {

        console.log(req.body.test);

        let wiqlQuery = `SELECT 
            [System.Id],
            [System.WorkItemType],
            [System.Title],
            [System.AssignedTo],
            [System.State],
            [System.Tags],
            [CSEngineering.ActivityStartDate],
            [CSEngineering.ActivityDuration],
            [CSEngineering.ParticipationStartDate],
            [CSEngineering.ParticipationDurationDays] 
        FROM WorkItems 
        WHERE 
            [System.TeamProject] = @project
            AND (`;

        //hacky workaround to query all users
        req.body.users.forEach(function(user, index) {
            console.log(req.body.users.length, index);
            wiqlQuery += `[System.AssignedTo] = '${user}' ${req.body.users.length-1 === index ? "" : " OR"}`
        });             
        
        wiqlQuery += `)
            AND 
                (( 
                    [System.WorkItemType] = 'Activity' AND 
                    [CSEngineering.ActivityStartDate] > @today - 30 
                )
                OR (
                    [System.WorkItemType] = 'Participant' AND 
                    [CSEngineering.ParticipationStartDate] > @today - 30 
                ))`



        console.log(wiqlQuery);

        request.post({
            url: application.wiqlQueryUrl,
            method: 'POST',
            json: {
                wiql: wiqlQuery
            },
            headers: {
                Authorization: ' Bearer ' + req.body.authToken
            }
        }, function (err, response, body) {
            // console.log(err, response)
            if (!err) {
                res.json(body.payload);
            }
            else {
                console.log(err);
            }
        });
    
    
    }
    else {

    }

});


module.exports = router;