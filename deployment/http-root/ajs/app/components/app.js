(function (angular) {
    'use strict';

    //// JavaScript Code ////
    function configFunc($routeProvider,$locationProvider,$httpProvider,$sceProvider) {
        $locationProvider.html5Mode(true);
        $httpProvider.interceptors.push('myHttpInterceptor');
        //$httpProvider.interceptors.push('viewAsInterceptor');
        $sceProvider.enabled(false);
        $routeProvider.
            when('/codeine', {
                templateUrl: '/components/projects/projects.html',
                controller: 'projectsListCtrl',
                controllerAs: 'vm',
                resolve: {
                    projects : function($q,$log,CodeineService) {
                        var deferred = $q.defer();
                        CodeineService.getProjects().success(function(data) {
                            $log.debug("Resolved projects");
                            deferred.resolve(data);
                        }).error(function() {
                            deferred.reject('Error - failed to get projects');
                        });
                        return deferred.promise;
                    },
                    tabs: function($q,$log,CodeineService) {
                        var deferred = $q.defer();
                        CodeineService.getViewTabs().success(function(data) {
                            $log.debug("Resolved tabs");
                            deferred.resolve(data);
                        }).error(function() {
                            deferred.reject('Error - failed to get project tabs');
                        });
                        return deferred.promise;
                    }
                }
            }).
            when('/codeine/project/:project_name/command/:command_name/setup', {
                templateUrl: '/components/command_setup/command_setup.html',
                controller: 'commandSetupCtrl',
                controllerAs: 'vm',
                pageTitle: 'Command setup',
                resolve : {
                    command : function($q,$log,CodeineService,$route) {
                        var deferred = $q.defer();
                        CodeineService.getProjectConfiguration($route.current.params.project_name).success(function(data) {
                            $log.debug("Resolved command");
                            for (var i=0; i < data.commands.length; i++) {
                                if (data.commands[i].name === $route.current.params.command_name) {
                                    deferred.resolve(data.commands[i]);
                                }
                            }
                            deferred.reject('No such command in project ' + $route.current.params.command_name);
                        }).error(function() {
                            deferred.reject('Error - failed to get project configuration');
                        });
                        return deferred.promise;
                    }
                }
            }).
            when('/codeine/manage-codeine', {
                templateUrl: '/components/manage_codeine/manage_codeine.html',
                controller: 'manageCodeineCtrl',
                pageTitle: 'Manage',
                resolve: {
                    tabs: function($q,$log,CodeineService) {
                        var deferred = $q.defer();
                        CodeineService.getViewTabs().success(function(data) {
                            $log.debug("Resolved tabs");
                            deferred.resolve(data);
                        }).error(function() {
                            deferred.reject('Error - failed to get tabs');
                        });
                        return deferred.promise;
                    },
                    permissions : function($q,$log,CodeineService) {
                        var deferred = $q.defer();
                        CodeineService.getPermissions().success(function(data) {
                            $log.debug("Resolved permissions: " + angular.toJson(data));
                            deferred.resolve(data);
                        }).error(function() {
                            deferred.reject('Error - failed to get project permissions');
                        });
                        return deferred.promise;
                    },
                    projects: function($q,$log,CodeineService) {
                        var deferred = $q.defer();
                        CodeineService.getProjects().success(function(data) {
                            $log.debug("Resolved projects");
                            deferred.resolve(data);
                        }).error(function() {
                            deferred.reject('Error - failed to get projects');
                        });
                        return deferred.promise;
                    }
                }
            }).
            when('/codeine/manage/statistics', {
                templateUrl: '/components/manage_statistics/statistics.html',
                controller: 'statisticsCtrl',
                pageTitle: 'Statistics',
                resolve: {
                    statistics: function($q,$log,CodeineService) {
                        var deferred = $q.defer();
                        CodeineService.getManageStatistics().success(function(data) {
                            $log.debug("Resolved tabs");
                            deferred.resolve(data);
                        }).error(function() {
                            deferred.reject('Error - failed to get statistics');
                        });
                        return deferred.promise;
                    }
                }
            }).
            when('/codeine/new_project', {
                templateUrl: '/components/new_project/new_project.html',
                controller: 'newProjectCtrl',
                pageTitle: 'New Project',
                resolve: {
                    projects : function($q,$log,CodeineService) {
                        var deferred = $q.defer();
                        CodeineService.getProjects().success(function(data) {
                            $log.debug("Resolved projects");
                            deferred.resolve(data);
                        }).error(function() {
                            deferred.reject('Error - failed to get projects');
                        });
                        return deferred.promise;
                    }
                }
            }).
            when('/codeine/project/:project_name/status', {
                templateUrl: '/components/project_status/project_status.html',
                controller: 'projectStatusWithMenuCtrl',
                reloadOnSearch: false,
                pageTitle: 'Project Status',
                resolve: {
                    projectConfiguration : function($q,$log,$route,CodeineService) {
                        var deferred = $q.defer();
                        CodeineService.getProjectConfiguration($route.current.params.project_name).success(function(data) {
                            $log.debug("Resolved project configuration");
                            deferred.resolve(data);
                        }).error(function() {
                            deferred.reject('Error - failed to get project configuration');
                        });
                        return deferred.promise;
                    },
                    projectStatus :  function($q,$log,$route,CodeineService) {
                        var deferred = $q.defer();
                        CodeineService.getProjectStatus($route.current.params.project_name).success(function(data) {
                            $log.debug("Resolved projectStatus");
                            deferred.resolve(data);
                        }).error(function() {
                            deferred.reject('Error - failed to get project status');
                        });
                        return deferred.promise;
                    }
                }
            }).
            when('/codeine/project/:project_name/timeline', {
                templateUrl: '/components/project_graph/project_graph.html',
                controller: 'projectGraphCtrl',
                pageTitle: 'Project Timeline',
                resolve: {
                    graphData : function($q,$log,$route,CodeineService) {
                        var deferred = $q.defer();
                        CodeineService.getProjectMonitorStatistics($route.current.params.project_name).success(function(data) {
                            $log.debug("Resolved project graph data");
                            deferred.resolve(data);
                        }).error(function() {
                            deferred.reject('Error - failed to get project graph data');
                        });
                        return deferred.promise;
                    }
                }
            }).
            when('/codeine/nodes/status', {
                templateUrl: '/components/project_status/internal_nodes_status.html',
                controller: 'projectStatusWithMenuCtrl',
                reloadOnSearch: false,
                pageTitle: 'Nodes Status',
                resolve: {
                    projectConfiguration : function($q,$log,$route,CodeineService,Constants) {
                        var deferred = $q.defer();
                        CodeineService.getProjectConfiguration(Constants.CODEINE_NODES_PROJECT_NAME).success(function(data) {
                            $log.debug("Resolved project configuration");
                            deferred.resolve(data);
                        }).error(function() {
                            deferred.reject('Error - failed to get project configuration');
                        });
                        return deferred.promise;
                    },
                    projectStatus :  function($q,$log,$route,CodeineService,Constants) {
                        var deferred = $q.defer();
                        CodeineService.getProjectStatus(Constants.CODEINE_NODES_PROJECT_NAME).success(function(data) {
                            $log.debug("Resolved projectStatus");
                            deferred.resolve(data);
                        }).error(function() {
                            deferred.reject('Error - failed to get project status');
                        });
                        return deferred.promise;
                    }
                }
            }).
            when('/codeine/project/:project_name/node/:node_name/status', {
                templateUrl: '/components/node_status/node_status.html',
                controller: 'nodeStatusCtrl',
                pageTitle: 'Node Status',
                resolve: {
                    projectConfiguration : function($q,$log,$route,CodeineService) {
                        var deferred = $q.defer();
                        CodeineService.getProjectConfiguration($route.current.params.project_name).success(function(data) {
                            $log.debug("Resolved project configuration");
                            deferred.resolve(data);
                        }).error(function() {
                            deferred.reject('Error - failed to get project configuration');
                        });
                        return deferred.promise;
                    },
                    nodeStatus :  function($q,$log,$route,CodeineService) {
                        var deferred = $q.defer();
                        CodeineService.getNodeStatus($route.current.params.project_name, $route.current.params.node_name).success(function(data) {
                            $log.debug("Resolved nodeStatus");
                            deferred.resolve(data);
                        }).error(function() {
                            deferred.reject('Error - failed to get node status');
                        });
                        return deferred.promise;
                    }
                }
            }).
            when('/codeine/project/:project_name/node/:node_name/monitor/:monitor_name/status', {
                templateUrl: '/components/monitor_status/monitor_status.html',
                controller: 'monitorStatusCtrl',
                controllerAs: 'vm',
                pageTitle: 'Monitor Status',
                resolve: {
                    monitorStatus :  function($q,$log,$route,CodeineService) {
                        var deferred = $q.defer();
                        CodeineService.getMonitorStatus($route.current.params.project_name, $route.current.params.node_name, $route.current.params.monitor_name).success(function(data) {
                            $log.debug("Resolved monitorStatus");
                            deferred.resolve(data);
                        }).error(function() {
                            deferred.reject('Error - failed to get monitor status');
                        });
                        return deferred.promise;
                    }
                }
            }).
            when('/codeine/project/:project_name/command/:command_name/:command_id/status', {
                templateUrl: '/components/command_status/command_status.html',
                controller: 'commandStatusCtrl',
                pageTitle: 'Command Status',
                resolve: {
                    commandStatus :  function($q,$log,$route,CodeineService) {
                        var deferred = $q.defer();
                        CodeineService.getCommandStatus($route.current.params.project_name, $route.current.params.command_id).success(function(data) {
                            $log.debug("Resolved commandStatus");
                            deferred.resolve(data);
                        }).error(function() {
                            deferred.reject('Error - failed to get command status');
                        });
                        return deferred.promise;
                    }
                }
            }).
            when('/codeine/project/:project_name/configure', {
                templateUrl: '/components/project_configure/project_configure.html',
                controller: 'projectConfigureCtrl',
                pageTitle: 'Project Configure',
                resolve: {
                    projectConfigurationForEditing : function($q,$log,$route,CodeineService) {
                        var deferred = $q.defer();
                        CodeineService.getProjectConfiguration($route.current.params.project_name).success(function(data) {
                            $log.debug("Resolved project configuration");
                            deferred.resolve(data);
                        }).error(function() {
                            deferred.reject('Error - failed to get project configuration');
                        });
                        return deferred.promise;
                    },
                    nodes :  function($q,$log,$route,CodeineService) {
                        var deferred = $q.defer();
                        CodeineService.getProjectNodes($route.current.params.project_name).success(function(data) {
                            $log.debug("Resolved project nodes");
                            deferred.resolve(data);
                        }).error(function() {
                            deferred.reject('Error - failed to get project nodes');
                        });
                        return deferred.promise;
                    }
                }
            }).
            when('/codeine/user/:user_name', {
                templateUrl: '/components/user_info/user_info.html',
                pageTitle: 'User Info',
                controller: function($scope,userInfo) {
                    $scope.userInfo = userInfo;
                },
                resolve: {
                    userInfo : function($q,$log,$route,CodeineService) {
                        var deferred = $q.defer();
                        CodeineService.getUserInfo().success(function(data) {
                            $log.debug("Resolved userInfo");
                            deferred.resolve(data);
                        }).error(function() {
                            deferred.reject('Error - failed to get user info');
                        });
                        return deferred.promise;
                    }
                }

            }).
            when('/', {
                redirectTo: '/codeine'
            }).
            otherwise({
                templateUrl: '/views/404.html'
            });
    }

    function runFunc($rootScope, $log, CodeineService, $interval, ApplicationFocusService, LoginService) {
        $rootScope.app = {
            loading: null,
            logginIn : true
        };

        ApplicationFocusService.init();
        LoginService.init();

        LoginService.gettingSessionInfo().then(function() {
            $rootScope.app.logginIn = false;
        }, function(){
            $rootScope.app.logginIn = false;
        });

        $rootScope.$on('$locationChangeStart', function () {
            $log.debug('$locationChangeStart');
            $rootScope.app.loading = true;
        });

        $rootScope.$on('$locationChangeSuccess', function () {
            $log.debug('$locationChangeSuccess');
            $rootScope.app.loading = false;
        });

        var loadConfiguration = function() {
            if ((!ApplicationFocusService.isInFocus()) && (angular.isDefined($rootScope.app.globalConfiguration))) {
                $log.debug('run: will skip config refresh as app not in focus');
                return;
            }
            CodeineService.getGlobalConfiguration().success(function(data) {
                $log.debug('run: got global configuration ' + angular.toJson(data));
                $rootScope.app.globalConfiguration = data;
            });

            CodeineService.getExperimentalConfiguration().success(function(data) {
                $log.debug('run: got experimental configuration ' + angular.toJson(data));
                $rootScope.app.experimentalConfiguration = data;
            });
        };

        loadConfiguration();
        $interval(loadConfiguration,300000);
    }

    //// Angular Code ////
    angular.module('codeine', ['ngRoute', 'ngAnimate', 'ui.bootstrap','ui.select2','ngStorage','ui.validate','ngTextcomplete','ngDistinctValues','n3-charts.linechart','angulartics', 'angulartics.google.analytics','filter.duration'])
    .config(configFunc)
    .run(runFunc);

})(angular);