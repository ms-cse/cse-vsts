 //========= ADAL Input Vars ==========================
let clientId = '080c1615-76d7-4ba0-97c7-3e57aab018d0';
let replyUri = window.location.origin;
let vstsResourceId = '499b84ac-1321-427f-aa17-267ca6975798';
//=====================================================

let activityTags = ['#Account_Management','#BusinessProductivity','#Connect','#DE_AI_ComputerVision','#DE_Containers_Microservices','#DE_IoT_AssetManagement','#DE_MixedReality','#DE_Serverless','#DE_Teams_Graph','#GISV_Recruit','#IntelligentCloud','#MPC','#OSS','#SaaS_Offering','#Tech_.Net','#Tech_AIOther','#Tech_AnalysisServices','#Tech_Analytics','#Tech_APIApp','#Tech_APIManagement','#Tech_ApplicationGateway','#Tech_ApplicationInsights','#Tech_AppService','#Tech_ARM','#Tech_ASP.Net','#Tech_Authorization (RBAC)','#Tech_Azure','#Tech_Azure SQL Database','#Tech_Azure SQL DW','#Tech_AzureActiveDirectory','#Tech_AzureAD','#Tech_AzureAppServices','#Tech_AzureBatch','#Tech_AzureCompute','#Tech_AzureContainerService','#Tech_AzureData&amp;Storage','#Tech_AzureFunctions','#Tech_AzureGPU','#Tech_AzureKubernetesService','#Tech_AzureMarketplace','#Tech_AzureMedia&amp;CDN','#Tech_AzureMonitor','#Tech_AzureMySQL','#Tech_AzureNetwork','#Tech_AzureNetworking','#Tech_AzurePostgreSQL','#Tech_AzureSearch','#Tech_AzureSQLDW','#Tech_AzureStorage','#Tech_BizTalkServices','#Tech_Blockchain','#Tech_BotFramework','#Tech_Bots','#Tech_CaaP','#Tech_CDN','#Tech_CloudServices','#Tech_CNTK','#Tech_CognitiveServices','#Tech_ContainersOther','#Tech_CortanaSkills','#Tech_CosmosDB','#Tech_Databricks','#Tech_DataCatalog','#Tech_DataFactory','#Tech_DataLake','#Tech_DataLakeAnalytics','#Tech_DataLakeStorage','#Tech_DataPlatform','#Tech_DataServiceOther','#Tech_Desktop','#Tech_DeveloperServices','#Tech_DevOps','#Tech_Docker','#Tech_DocumentDB','#Tech_Dynamics365','#Tech_Edge','#Tech_Engineering Practice','#Tech_EventGrid','#Tech_EventHub','#Tech_EventHubs','#Tech_ExpressRoute','#Tech_GameServices','#Tech_Gaming','#Tech_GPUCompute','#Tech_Hadoop','#Tech_HDInsight','#Tech_Holographic','#Tech_Hololens','#Tech_Identity&amp;Access','#Tech_Immersive','#Tech_IoT','#Tech_IoTHub','#Tech_IoTOther','#Tech_KeyVault','#Tech_Linux','#Tech_LinuxVM','#Tech_LogicApps','#Tech_MachineLearning','#Tech_MachineLearningWorkBench','#Tech_Media','#Tech_MediaServices','#Tech_Microservices','#Tech_MicrosoftGraph','#Tech_MicrosoftTeams','#Tech_MobileApp','#Tech_MobileCenter','#Tech_MobileEngagement','#Tech_MobileOther','#Tech_ModeratorServices','#Tech_NotificationHub','#Tech_O365','#Tech_OfficeExtensibility UX','#Tech_OfficeGroupConnectors','#Tech_OneDrive','#Tech_OperationalInsights','#Tech_Outlook_Exchange','#Tech_PhotoDNA','#Tech_PowerBI','#Tech_ProjectOxford','#Tech_RedisCache','#Tech_RemoteApp','#Tech_RServer','#Tech_Search','#Tech_SecurityCenter','#Tech_ServiceBus','#Tech_ServiceFabric','#Tech_SharePoint','#Tech_SingleVM','#Tech_SkypeConsumer','#Tech_SkypeforBusiness','#Tech_SolutionTemplates','#Tech_SQLDB','#Tech_SQLReporting','#Tech_SQLServer','#Tech_Stack','#Tech_StreamAnalytics','#Tech_Tensorflow','#Tech_TrafficManager','#Tech_UWPApps','#Tech_VirtualMachines','#Tech_VirtualNetwork','#Tech_VMExtensions','#Tech_VSCode','#Tech_VSTS','#Tech_WebApp','#Tech_Windows','#Tech_WindowsIoT','#Tech_WindowsVM','#Tech_Xamarin','#Tech_XamarinTestCloud','#TechPlayReady','#Temp_AsiaReview','#TWG','#TWG_Client','#TWG_HighScaleData'];
let projectId, authToken, projectData, isParticipant = false;

// Set up ADAL
let authContext = new AuthenticationContext({
    clientId: clientId,
    redirectUri: replyUri,
    postLogoutRedirectUri: replyUri,
    cacheLocation: 'localStorage' // for MS Edge
});

$(document).ready(function () {
    // hack to fix incorrect auth requests
    if(window.location.href.indexOf('null') !== -1 && !authContext.getCachedUser() ) {
        authContext.login();
    }

    // listen to incoming auth requests
    if (authContext.isCallback(window.location.hash)) {
        authContext.handleWindowCallback();
        let err = authContext.getLoginError();
        if (err) {
            console.log('AUTH ERROR:\n\n' + err);
        }
    } else {
        // if logged in, get access token and make an API request
        let user = authContext.getCachedUser();
        console.log('trying to get usersss', user);
        if (user) {
            $('#activityForm').show();
            $('#loginBtn').html('Click here to logout');
            $('#owner').val(user.profile.name + ' <' + user.userName + '>');

            // Get an access token to VSTS
            authContext.acquireToken(vstsResourceId, function (error, token) {
                console.log(error, token);
                authToken = token;
             });
        }
        else {
            console.log('couldnt get user');
        }
    }


    //initialize tags input
    $('#tags').tagsinput({
        typeahead: {
        source: activityTags,
           afterSelect: function() {
               this.$element[0].value = '';
            }
        }
    });

    // initialize bootstrap datepickers
    $('#datepicker').datepicker({
        autoclose: true,
        todayHighlight: true
    }).datepicker('setDate','now');

    $('#loginBtn').on('click', () => {
        if(authContext.getCachedUser() && authContext.getCachedUser().userName)
            authContext.logOut();
        else
            authContext.login();
    });

    // binds 'enter' key to also search
    $('#projectId').keypress(e => {
        if(e.keyCode === 13)
            searchProject();
    })

    $('#submitBtn').on('click', () => {
        if(projectId && $('#name').val() && $('#date-from').val() && $('#duration').val()) {
            $.post('/workitems/new/', {
                projectId: projectId,
                isParticipant: isParticipant,
                name: $('#name').val(),
                owner: $('#owner').val(),
                areapath: $('#areapath').val(),
                country: $('#country').val(),
                city: $('#city').val(),
                type: $('#activitytype').val(),
                dateFrom: $('#date-from').val(),
                duration: $('#duration').val(),
                description: $('#description').val(),
                goal: $('#goal').val(),
                tags: $('#tags').val(),
                token: authToken
            }).done(function(res) {
                $('#main-container').html("<h2>VSTS - Create Activity</h2><br/>Your activity has successfully been added.<br/><a href='https://cseng.visualstudio.com/CSEng/_workitems?id="+res.id+"' target='_blank'>Click here to view your activity</a><br/><br/><a href='javascript:window.location.reload(true)'>Click here to add another activity</a>");
            });
        }
        else {
            alert('Please fill in a project, name, date and duration');
        }
    });

    $("#searchProject").on('click', searchProject);

    $('#selectProjectBtn').on('click', function(e) {
        let data_id = $('table.project-table tr.selected').attr('data-id');

        if(data_id && projectData[data_id]) {
            let project = projectData[data_id];

            prefillProjectData({
                area: project[8],
                country: project[10],
                city: project[9],
                id: project[0],
                title: project[7]
            });

            $('#projectSearch').modal('hide');
        }
        else {
            window.alert('Please select a project first');
        }
    });
});

function searchProject() {
    if($('#projectId').val()) {

        if(isNaN(parseInt($('#projectId').val()))) {

            $.post('/workitems/query', {
                token: authToken,
                filter: $('#projectId').val()
            }).done((workItemData) => {
                console.log(workItemData)
                projectData = workItemData.rows;

                $('#projectSearch').modal('show');
                let projectHtml = "";

                workItemData.rows.forEach(function(item, index) {
                    projectHtml += `<tr ${item[1] === "Organization" ? "class='no-hover'" : ""} data-id="${index}">
                      <td><img src="img/${item[1] === "Organization" ? "organization" : "project"}.png" style="margin-left: ${item[1] === "Organization" ? "0" : "20"}px;" width="24"  /> ${item[7]}</td>
                      <td class="d-none d-sm-table-cell d-sm-block">${item[6]}</td>
                      <td class="d-none d-sm-table-cell d-sm-block">${item[9]}</td>
                      <td class="d-none d-sm-table-cell d-sm-block">${item[10]}</td>
                    </tr>`;
                });

                $('#projectSearch tbody').html(projectHtml);

                $('table.project-table tr:not(.no-hover)').on('click', function(e) {
                    $('table.project-table tr.selected').removeClass('selected');
                    $(this).addClass('selected');
                });
            })
            .fail(() => {
                window.alert('Couldn\'t find Project or Engagement')
            });
        }
        else {

            $.post('/workitems/' + $('#projectId').val(), {
                token: authToken
            }).done((workItemData) => {
                prefillProjectData({
                    area: workItemData['System.AreaPath'],
                    country: workItemData['CSEngineering.CountrySelection'],
                    city: workItemData['CSEngineering.City'],
                    id: $('#projectId').val(),
                    title: workItemData['System.Title']
                });
            })
            .fail(() => {
                window.alert('Couldn\'t find Project or Engagement with this Project ID')
            });
        }
    }
}

function prefillProjectData(data) {
    projectId = data.id; // set global var

    $('#areapath').val(data.area)
    $('#country').val(data.country)
    $('#city').val(data.city)

    $('#projectId').val(data.id + ' (' + data.title + ')');

    $('#name').prop('disabled', false);
    $('#name').prop('placeholder', '');
    $('#name').val('');

    toggleParticipantForm(false);

    //getting activities for activity-title autocomplete
    $.post('/workitems/activities/' + projectId, {
        token: authToken
    }).done((activityData) => {
        if(activityData.rows.length > 0)
            createAutocomplete(activityData)
    })
    .fail(() => {
        console.log('Couldn\'t get activities for this project ID')
    });
}

function createAutocomplete(activityData) {
    //first filter all activities and get appropriate fields
    let autoCompleteData = [];
    activityData.rows.forEach(function(item) {
        if(item[1] === 'Activity') {
            autoCompleteData.push({
                id: item[0],
                name: item[7],
                date: item[12]
            })
        };
    });

    let titleInput = $('#name');
    titleInput.typeahead('destroy'); //destroy any possible previously created autocomplete

    titleInput.typeahead({
      source: autoCompleteData,
      autoSelect: true
    });

    titleInput.change(function() {
      var current = titleInput.typeahead('getActive');
      if (current) {
        if (current.name == titleInput.val()) {
            projectId = current.id;
            toggleParticipantForm(true);

            //update date
            let dateObj = new Date(parseInt(current.date.substr(6,13)));
            $('#datepicker').datepicker('setDate', dateObj)
        } else {
            toggleParticipantForm(false);
        }
      }
    });
}

function toggleParticipantForm(show) {
    isParticipant = show;

    if(show) {
        $('#activitySelector').hide();
        $('#goalSelector').hide();
        $('#activityLabel').html('Activity Name (<img src="img/participant.png" width="20" />)');
    }
    else {
        $('#activitySelector').show();
        $('#goalSelector').show();
        $('#activityLabel').html('Activity Name');
    }
}
