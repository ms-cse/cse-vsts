$(document).ready(function () {
    let projectId;
    let activityTags = ['#Account_Management','#BusinessProductivity','#Connect','#DE_AI_ComputerVision','#DE_Containers_Microservices','#DE_IoT_AssetManagement','#DE_MixedReality','#DE_Serverless','#DE_Teams_Graph','#GISV_Recruit','#IntelligentCloud','#MPC','#OSS','#SaaS_Offering','#Tech_.Net','#Tech_AIOther','#Tech_AnalysisServices','#Tech_Analytics','#Tech_APIApp','#Tech_APIManagement','#Tech_ApplicationGateway','#Tech_ApplicationInsights','#Tech_AppService','#Tech_ARM','#Tech_ASP.Net','#Tech_Authorization (RBAC)','#Tech_Azure','#Tech_Azure SQL Database','#Tech_Azure SQL DW','#Tech_AzureActiveDirectory','#Tech_AzureAD','#Tech_AzureAppServices','#Tech_AzureBatch','#Tech_AzureCompute','#Tech_AzureContainerService','#Tech_AzureData&amp;Storage','#Tech_AzureFunctions','#Tech_AzureGPU','#Tech_AzureKubernetesService','#Tech_AzureMarketplace','#Tech_AzureMedia&amp;CDN','#Tech_AzureMonitor','#Tech_AzureMySQL','#Tech_AzureNetwork','#Tech_AzureNetworking','#Tech_AzurePostgreSQL','#Tech_AzureSearch','#Tech_AzureSQLDW','#Tech_AzureStorage','#Tech_BizTalkServices','#Tech_Blockchain','#Tech_BotFramework','#Tech_Bots','#Tech_CaaP','#Tech_CDN','#Tech_CloudServices','#Tech_CNTK','#Tech_CognitiveServices','#Tech_ContainersOther','#Tech_CortanaSkills','#Tech_CosmosDB','#Tech_Databricks','#Tech_DataCatalog','#Tech_DataFactory','#Tech_DataLake','#Tech_DataLakeAnalytics','#Tech_DataLakeStorage','#Tech_DataPlatform','#Tech_DataServiceOther','#Tech_Desktop','#Tech_DeveloperServices','#Tech_DevOps','#Tech_Docker','#Tech_DocumentDB','#Tech_Dynamics365','#Tech_Edge','#Tech_Engineering Practice','#Tech_EventGrid','#Tech_EventHub','#Tech_EventHubs','#Tech_ExpressRoute','#Tech_GameServices','#Tech_Gaming','#Tech_GPUCompute','#Tech_Hadoop','#Tech_HDInsight','#Tech_Holographic','#Tech_Hololens','#Tech_Identity&amp;Access','#Tech_Immersive','#Tech_IoT','#Tech_IoTHub','#Tech_IoTOther','#Tech_KeyVault','#Tech_Linux','#Tech_LinuxVM','#Tech_LogicApps','#Tech_MachineLearning','#Tech_MachineLearningWorkBench','#Tech_Media','#Tech_MediaServices','#Tech_Microservices','#Tech_MicrosoftGraph','#Tech_MicrosoftTeams','#Tech_MobileApp','#Tech_MobileCenter','#Tech_MobileEngagement','#Tech_MobileOther','#Tech_ModeratorServices','#Tech_NotificationHub','#Tech_O365','#Tech_OfficeExtensibility UX','#Tech_OfficeGroupConnectors','#Tech_OneDrive','#Tech_OperationalInsights','#Tech_Outlook_Exchange','#Tech_PhotoDNA','#Tech_PowerBI','#Tech_ProjectOxford','#Tech_RedisCache','#Tech_RemoteApp','#Tech_RServer','#Tech_Search','#Tech_SecurityCenter','#Tech_ServiceBus','#Tech_ServiceFabric','#Tech_SharePoint','#Tech_SingleVM','#Tech_SkypeConsumer','#Tech_SkypeforBusiness','#Tech_SolutionTemplates','#Tech_SQLDB','#Tech_SQLReporting','#Tech_SQLServer','#Tech_Stack','#Tech_StreamAnalytics','#Tech_Tensorflow','#Tech_TrafficManager','#Tech_UWPApps','#Tech_VirtualMachines','#Tech_VirtualNetwork','#Tech_VMExtensions','#Tech_VSCode','#Tech_VSTS','#Tech_WebApp','#Tech_Windows','#Tech_WindowsIoT','#Tech_WindowsVM','#Tech_Xamarin','#Tech_XamarinTestCloud','#TechPlayReady','#Temp_AsiaReview','#TWG','#TWG_Client','#TWG_HighScaleData'];

    $('#tags').tagsinput({
        typeahead: {
        source: activityTags,
           afterSelect: function() {
               this.$element[0].value = '';
            }
        }
    });

    // initialize bootstrap datepickers
    $('.datepicker').datepicker({
        icons: {
            date: "fa fa-calendar",
            up: "fa fa-arrow-up",
            down: "fa fa-arrow-down"
        }
    });

    document.getElementById("submitBtn").addEventListener("click", () => {

        if(projectId && $('#name').val() && $('#date-from').val() && $('#duration').val()) {
            $.post('/workitems/new/', {
                projectId: projectId,
                name: $('#name').val(),
                areapath: $('#areapath').val(),
                country: $('#country').val(),
                city: $('#city').val(),
                type: $('#activitytype').val(),
                dateFrom: $('#date-from').val(),
                duration: $('#duration').val(),
                description: $('#description').val(),
                goal: $('#goal').val(),
                tags: $('#tags').val()
            }).done(function(res) {
                console.log(res);
                $("#main-container").html("<h2>VSTS - Create Activity</h2><br/><br/>You're activity has been successfully added.<br/><a href='https://cseng.visualstudio.com/CSEng/_workitems?id="+res.id+"' target='_blank'>Click here to view your activity</a><br/><br/><a href='javascript:window.location.reload(true)'>Click here to add another activity</a>");
            });

        }
    });

    document.getElementById("searchProject").addEventListener("click", () => {
        console.log('searching project');

        if($('#projectId').val()) {

            projectId = $('#projectId').val();

            $.getJSON('/workitems/' + $('#projectId').val(), function(workItemData) {
                console.log(workItemData);
                $('#areapath').val(workItemData['System.AreaPath'])
                $('#country').val(workItemData['CSEngineering.CountrySelection'])
                $('#city').val(workItemData['CSEngineering.City'])

                $('#projectId').val(projectId + ' (' + workItemData['System.Title'] + ')');
            });
        }

    });
});
