"use strict";
// Core exports from dispatch-command service module
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createToolDefinition = exports.createDispatchTools = exports.createDispatchToolHandlers = exports.DISPATCH_COMMAND_TOOLS = exports.ResponseTimeReport = exports.DispatchDashboard = exports.AutoDispatcher = exports.SLAMonitor = exports.DispatchAPIHandlers = exports.SLAService = exports.SchedulingService = exports.RoutingService = exports.TruckService = exports.DriverService = exports.DispatchService = exports.calculateSLADeadline = exports.getSLAThreshold = exports.SLA_THRESHOLDS = exports.FIREBASE_CONFIG = exports.DISPATCH_CONFIG = exports.APP_CONFIG = exports.seedTrucks = exports.seedDrivers = exports.seedZones = exports.seedAll = exports.InMemoryRepository = void 0;
var repository_1 = require("./data/repository");
Object.defineProperty(exports, "InMemoryRepository", { enumerable: true, get: function () { return repository_1.InMemoryRepository; } });
__exportStar(require("./data/schema"), exports);
var zone_seeds_1 = require("./config/zone-seeds");
Object.defineProperty(exports, "seedAll", { enumerable: true, get: function () { return zone_seeds_1.seedAll; } });
Object.defineProperty(exports, "seedZones", { enumerable: true, get: function () { return zone_seeds_1.seedZones; } });
Object.defineProperty(exports, "seedDrivers", { enumerable: true, get: function () { return zone_seeds_1.seedDrivers; } });
Object.defineProperty(exports, "seedTrucks", { enumerable: true, get: function () { return zone_seeds_1.seedTrucks; } });
var index_1 = require("./config/index");
Object.defineProperty(exports, "APP_CONFIG", { enumerable: true, get: function () { return index_1.APP_CONFIG; } });
Object.defineProperty(exports, "DISPATCH_CONFIG", { enumerable: true, get: function () { return index_1.DISPATCH_CONFIG; } });
Object.defineProperty(exports, "FIREBASE_CONFIG", { enumerable: true, get: function () { return index_1.FIREBASE_CONFIG; } });
var sla_thresholds_1 = require("./config/sla-thresholds");
Object.defineProperty(exports, "SLA_THRESHOLDS", { enumerable: true, get: function () { return sla_thresholds_1.SLA_THRESHOLDS; } });
Object.defineProperty(exports, "getSLAThreshold", { enumerable: true, get: function () { return sla_thresholds_1.getSLAThreshold; } });
Object.defineProperty(exports, "calculateSLADeadline", { enumerable: true, get: function () { return sla_thresholds_1.calculateSLADeadline; } });
var dispatch_service_1 = require("./services/dispatch-service");
Object.defineProperty(exports, "DispatchService", { enumerable: true, get: function () { return dispatch_service_1.DispatchService; } });
var driver_service_1 = require("./services/driver-service");
Object.defineProperty(exports, "DriverService", { enumerable: true, get: function () { return driver_service_1.DriverService; } });
var truck_service_1 = require("./services/truck-service");
Object.defineProperty(exports, "TruckService", { enumerable: true, get: function () { return truck_service_1.TruckService; } });
var routing_service_1 = require("./services/routing-service");
Object.defineProperty(exports, "RoutingService", { enumerable: true, get: function () { return routing_service_1.RoutingService; } });
var scheduling_service_1 = require("./services/scheduling-service");
Object.defineProperty(exports, "SchedulingService", { enumerable: true, get: function () { return scheduling_service_1.SchedulingService; } });
var sla_service_1 = require("./services/sla-service");
Object.defineProperty(exports, "SLAService", { enumerable: true, get: function () { return sla_service_1.SLAService; } });
var handlers_1 = require("./api/handlers");
Object.defineProperty(exports, "DispatchAPIHandlers", { enumerable: true, get: function () { return handlers_1.DispatchAPIHandlers; } });
var sla_monitor_1 = require("./hooks/sla-monitor");
Object.defineProperty(exports, "SLAMonitor", { enumerable: true, get: function () { return sla_monitor_1.SLAMonitor; } });
var auto_dispatcher_1 = require("./hooks/auto-dispatcher");
Object.defineProperty(exports, "AutoDispatcher", { enumerable: true, get: function () { return auto_dispatcher_1.AutoDispatcher; } });
var dispatch_dashboard_1 = require("./reporting/dispatch-dashboard");
Object.defineProperty(exports, "DispatchDashboard", { enumerable: true, get: function () { return dispatch_dashboard_1.DispatchDashboard; } });
var response_time_report_1 = require("./reporting/response-time-report");
Object.defineProperty(exports, "ResponseTimeReport", { enumerable: true, get: function () { return response_time_report_1.ResponseTimeReport; } });
var tools_1 = require("./tools");
Object.defineProperty(exports, "DISPATCH_COMMAND_TOOLS", { enumerable: true, get: function () { return tools_1.DISPATCH_COMMAND_TOOLS; } });
Object.defineProperty(exports, "createDispatchToolHandlers", { enumerable: true, get: function () { return tools_1.createDispatchToolHandlers; } });
Object.defineProperty(exports, "createDispatchTools", { enumerable: true, get: function () { return tools_1.createDispatchTools; } });
Object.defineProperty(exports, "createToolDefinition", { enumerable: true, get: function () { return tools_1.createToolDefinition; } });
//# sourceMappingURL=index.js.map