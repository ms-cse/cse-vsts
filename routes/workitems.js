'use strict';

let application = require('../application');
let helpers = require('../helpers');
let express     = require('express');
let router      = express.Router();
let request     = require('request');
let vsts        = require('vso-node-api');

// let creds = vsts.getPersonalAccessTokenHandler(application.authToken);
let creds, connection, vstsWI;

router.post('/query', (req, res) => {
    let authToken = req.body.token;

    let wiqlQuery = `SELECT
        [System.Id],
        [System.WorkItemType],
        [System.Title],
        [System.AssignedTo],
        [System.Tags],
        [System.AreaPath],
        [CSEngineering.City],
        [CSEngineering.CountrySelection]
    FROM workitemLinks
    WHERE
        (
            [Source].[System.TeamProject] = @project
            AND [Source].[System.WorkItemType] = 'Organization'
            AND [Source].[System.Title] CONTAINS WORDS '"${req.body.filter}"'
        )
        AND (
            [System.Links.LinkType] = 'System.LinkTypes.Hierarchy-Forward'
        )
        AND (
            [Target].[System.TeamProject] = @project
            AND [Target].[System.WorkItemType] = 'Project or Engagement'
            AND (
                [Target].[CSEngineering.CountrySelection] = 'Austria'
                OR [Target].[CSEngineering.CountrySelection] = 'Germany'
                OR [Target].[CSEngineering.CountrySelection] = 'Netherlands'
                OR [Target].[CSEngineering.CountrySelection] = 'Switzerland'
            )
        )
    MODE (Recursive)`;

    request.post({
        url: application.wiqlQueryUrl,
        method: 'POST',
        json: {
            wiql: wiqlQuery
        },
        headers:{
            Authorization: ' Bearer ' + authToken
       }
    }, function(err, response, body) {
        // console.log(err, response)
        if(!err) {
            res.json(body.payload);
        }
        else {
            console.log(err);
        }
    });
});

router.post('/activities/:projectId', (req, res) => {
    let authToken = req.body.token;

    let wiqlQuery = `SELECT
        [System.Id],
        [System.Title],
        [CSEngineering.AssignedPM],
        [System.AreaPath],
        [CSEngineering.City],
        [CSEngineering.Country],
        [CSEngineering.ActivityStartDate],
        [System.Tags]
    FROM WorkItemLinks
    WHERE (
        [Source].[System.TeamProject] = @project
        AND [Source].[System.WorkItemType] = 'Project or Engagement'
        AND [Source].[System.Id] = '${req.params.projectId}'
    )
    AND (
        [Target].[System.TeamProject] = @project
        AND [Target].[System.WorkItemType] = 'Activity'
    )
    ORDER BY [System.Title],[System.Id]
    mode(MustContain)`;

    console.log(wiqlQuery);

    request.post({
        url: application.wiqlQueryUrl,
        method: 'POST',
        json: {
            wiql: wiqlQuery
        },
        headers:{
            Authorization: ' Bearer ' + authToken
       }
    }, function(err, response, body) {
        // console.log(err, response)
        if(!err) {
            res.json(body.payload);
        }
        else {
            console.log(err);
        }
    });
})


router.post('/new', (req, res) => {
    if (req.body && req.body.projectId && req.body.name && req.body.type && req.body.duration && req.body.dateFrom && req.body.token) {
        creds = vsts.getBearerHandler(req.body.token);
        connection = new vsts.WebApi(application.collectionUrl, creds);
        vstsWI = connection.getWorkItemTrackingApi();

        let json = [{
            "op": "add",
            "path": "/fields/System.Title",
            "value": req.body.name + (req.body.isParticipant == "true" ? " - " + req.body.owner.split(' <')[0] : "")
        }, {
            "op": "add",
            "path": "/fields/System.AreaPath",
            "value": req.body.areapath
        }, {
            "op": "add",
            "path": "/fields/System.AssignedTo",
            "value": req.body.owner
        }, {
            "op": "add",
            "path": "/fields/System.Tags",
            "value": req.body.tags.split(',').join('; ')
        }, {
            "op": "add",
            "path": "/relations/-",
            "value": {
              "rel": "System.LinkTypes.Hierarchy-Reverse",
              "url": application.collectionUrl + "/_apis/wit/workItems/" + req.body.projectId,
            }
        }];

        if(req.body.isParticipant == "true") {
            json.push({
                "op": "add",
                "path": "/fields/CSEngineering.ParticipationStartDate",
                "value": helpers.formatDate(req.body.dateFrom)
            }, {
                "op": "add",
                "path": "/fields/CSEngineering.ParticipationDurationDays",
                "value": req.body.duration
            }, {
                "op": "add",
                "path": "/fields/System.Description",
                "value": req.body.description
            })
        }
        else {
            json.push({
                "op": "add",
                "path": "/fields/CSEngineering.ActivityStartDate",
                "value": helpers.formatDate(req.body.dateFrom)
            }, {
                "op": "add",
                "path": "/fields/CSEngineering.ActivityDuration",
                "value": req.body.duration
            }, {
                "op": "add",
                "path": "/fields/CSEngineering.ActivityType",
                "value": req.body.type
            }, {
                "op": "add",
                "path": "/fields/CSEngineering.CountrySelection",
                "value": req.body.country
            }, {
                "op": "add",
                "path": "/fields/CSEngineering.City",
                "value": req.body.city
            }, {
                "op": "add",
                "path": "/fields/CSEngineering.ShortDescription",
                "value": req.body.description
            }, {
                "op": "add",
                "path": "/fields/CSEngineering.TechnicalGoal",
                "value": req.body.goal
            })
        }

        console.log('kommaarrr', json);

        vstsWI.createWorkItem(null, json, application.projectName, req.body.isParticipant == "true" ? 'Participant' : 'Activity').then(workItem => {
            if(workItem) {
                res.json(workItem)
            }
            else {
                res.status(501).json({ message: 'something went wrong' });
            }
        });
    }
});

router.post('/:workItemId', (req, res) => {
    if(req.body.token) {
        creds = vsts.getBearerHandler(req.body.token);
        connection = new vsts.WebApi(application.collectionUrl, creds);
        vstsWI = connection.getWorkItemTrackingApi();

        console.log(req.params.workItemId, req.body.token)

        vstsWI.getWorkItem(req.params.workItemId).then(workItem => {
            // console.log(res);
            if(workItem && workItem.fields) {
                if(workItem.fields['System.WorkItemType'] == "Project or Engagement") {
                    res.json(workItem.fields)
                }
                else {
                    res.status(501).json({ message: 'item not a project or engagement' });
                }
            }
            else {
                res.status(501).json({ message: 'no results found' });
            }
        }).catch(function(err) {
            console.log(err);
        }) ;
    }
});


module.exports = router;
