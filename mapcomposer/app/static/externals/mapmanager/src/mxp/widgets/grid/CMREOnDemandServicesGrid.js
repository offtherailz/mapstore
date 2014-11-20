/*
*  Copyright (C) 2007 - 2014 GeoSolutions S.A.S.
*  http://www.geo-solutions.it
*
*  GPLv3 + Classpath exception
*
*  This program is free software: you can redistribute it and/or modify
*  it under the terms of the GNU General Public License as published by
*  the Free Software Foundation, either version 3 of the License, or
*  (at your option) any later version.
*
*  This program is distributed in the hope that it will be useful,
*  but WITHOUT ANY WARRANTY; without even the implied warranty of
*  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
*  GNU General Public License for more details.
*
*  You should have received a copy of the GNU General Public License
*  along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

/** api: (define)
 *  module = mxp.widgets
 *  class = CMREOnDemandServicesGrid
 *
 */
Ext.ns('mxp.widgets');

/**
 * Class: CMREOnDemandServicesGrid
 * Grid panel that shows the list of services.
 * Selection Model can be attached to get the data of a flow.
 *
 * GeoBatch REST API used
 * * (GET) "/process/{plugin_name}/services" : list of available services (e.g.: flows for GeoBatch)
 * * (GET) "/process/{plugin_name}/services/{serviceId}" : details about a service
 * * (GET) "/process/{plugin_name}/services/{serviceId}/runtimes" : the active intances of a service (e.g.: consumers for GeoBatch)
 *
 * Inherits from:
 *  - <Ext.grid.GridPanel>
 *
 */
mxp.widgets.CMREOnDemandServicesGrid = Ext.extend(Ext.grid.GridPanel, {

	/** api: xtype = mxw_cmre_ondemand_services_grid */
	xtype : "mxw_cmre_ondemand_services_grid",

	/**
	 * Property: osdi2ManagerRestURL
	 * {string} the OpenSDI2-Manager REST Url
	 */
	osdi2ManagerRestURL : 'http://localhost:8180/opensdi2-manager/mvc/process/geobatch/',

	/* i18n */
	nameText : 'Title',
	descriptionText : 'Description',
	newRunTitle : 'Create a new Service Process Run',
	newRunMessage : 'Running a new service will drop all previous inputs. Continue with the definition of a new service process run?',
    newServiceText: "CMRE On Demand Service: ",
    inputsText:" Inputs",
    issueANewRunText: "Issue a new run",
	/* end of i18n */
	//extjs grid specific config
	autoload : true,
	autoExpandColumn : 'description',

	//map panel configuration
	bounds :
		/* "143.835, -43.648, 148.479, -39.574" */
		/* "-20037508.34, -20037508.34, 20037508.34, 20037508.34" */
		"4702410.8061927, -4506173.1580895, 13742771.014279, 3144867.6240784",
	numZoomLevels : 19,
	maxZoomLevel : 3,
	zoom : 4,
	displayProjection : "EPSG:4326",
	projection : "EPSG:900913",
	units : "m",
	center : [10416231.543771133, -1365528.5403454066], // Indian Ocean
	
	viewConfig : {
		getRowClass : function(record, index) {
			var c = record.json.activeStatus;
			if (c == 'ENABLED') {
				return 'row-green';
			} else if (c == 'DISABLED') {
				return 'row-red';
			} else {
				return 'row-yellow';
			}
		}
	},

	/**
	 *
	 */
	initComponent : function() {
		this.bounds = new OpenLayers.Bounds.fromString(this.bounds);
		
		// create the Data Store
		this.store = new Ext.data.Store({
			autoLoad : this.autoload,
			// load using HTTP
			url : this.osdi2ManagerRestURL + 'services/',
			record : 'service',
			idPath : 'serviceId',
			fields : ['serviceId', 'name', 'description', 'activeStatus'],
			reader : new Ext.data.JsonReader({
				root : 'data',
				idPath : 'serviceId',
				fields : ['serviceId', 'name', 'description', 'activeStatus']
			}),
			listeners : {
				beforeload : function(a, b, c) {

					if (a.proxy.conn.headers) {
						if (this.auth) {
							a.proxy.conn.headers['Authorization'] = this.auth;
						}
						a.proxy.conn.headers['Accept'] = 'application/json';
					} else {
						a.proxy.conn.headers = {
							'Accept' : 'application/json'
						};
						if (this.auth) {
							a.proxy.conn.headers['Authorization'] = this.auth;
						}
					}

				}
			},
			sortInfo : {
				field : 'serviceId',
				direction : 'ASC' // or 'DESC' (case sensitive for local sorting)
			}
		});

		this.tbar = this.tbar || [];
		this.tbar.push({
			iconCls : 'refresh_ic',
			xtype : 'button',
			text : this.refreshText,
			scope : this,
			handler : function() {
				this.store.load();
			}
		});

		this.columns = [{
			id : 'id',
			header : "ID",
			width : 100,
			dataIndex : 'serviceId',
			sortable : true,
			hidden : true
		}, {
			id : 'name',
			header : this.nameText,
			width : 200,
			dataIndex : 'name',
			sortable : true
		}, {
			id : 'description',
			header : this.descriptionText,
			dataIndex : 'description',
			sortable : true
		}, {
			xtype : 'actioncolumn',
			width : 35,
			tooltip : this.issueANewRunText,
			handler : this.createNewProcessRun,
			scope : this,
			items : [{
				iconCls : 'add_ic',
				width : 25,
				tooltip : this.tooltipLog,
				scope : this,
				getClass : function(v, meta, rec) {
					if (rec.get('activeStatus') == 'DISABLED')
						return 'x-hide-display';
					return 'x-grid-center-icon action_column_btn';
				}
			}]
		}], mxp.widgets.CMREOnDemandServicesGrid.superclass.initComponent.call(this, arguments);
	},

	/**
	 *    private: method[createNewProcessRun] creates a new service input panel
	 *      * grid : the grid
	 *      * rowIndex: the index of the row
	 *      * colIndex: the actioncolumn index
	 */
	createNewProcessRun : function(grid, rowIndex, colIndex) {
		var record = grid.getStore().getAt(rowIndex);
		var serviceId = record.get('serviceId');
		var serviceName = record.get('name');
		var me = this;

		Ext.Msg.show({
			title : this.newRunTitle,
			msg : this.newRunMessage,
			buttons : Ext.Msg.OKCANCEL,
			fn : function(buttonId, text, opt) {
				if (buttonId === 'ok') {
					var mainPanel = Ext.getCmp("mainTabPanel");
					try {
						//mainPanel.removeAll();
						var serviceConfigurationPanel;
                        var itemId = 'CMREOnDemandServiceInputPanel';
						if (mainPanel.items.containsKey(itemId)) {
							serviceConfigurationPanel = mainPanel.items.get(itemId);
						}

						if (serviceConfigurationPanel) {
							mainPanel.remove(serviceConfigurationPanel);
						}
                        
						var mapPanel = new  GeoExplorer.Viewer({
                             
                             geoStoreBaseURL: this.geoStoreBaseURL,
                             disableLayerChooser: true,
							 renderToTab: 'mainTabPanel',
                             tools:[],
                             viewerTools:[],
                             portalConfig:{
                                title: me.newServiceText + serviceName,
                                closable : true,
                                closeAction : 'close',
                                itemId: itemId,
                                iconCls : 'nato_ic',
                                header : false,
                                deferredReneder : false,
                                hideMode: 'offsets',
                                forceLayout: true
                             },
                             customPanels:[{
								xtype : 'panel',
                                layout:'fit',
								osdi2ManagerRestURL : me.osdi2ManagerRestURL,
								serviceId: serviceId,
								serviceName: serviceName,
								region : 'west',
								iconCls : 'nato_ic',
								title : serviceName + " " + me.inputsText,
								autoScroll : true,
								width : 600,
								ref : '../../inputForm',
								collapsible : true,
								auth : me.auth,
								sm : null,
                                deferredReneder : false,
                                hideMode: 'offsets',
                                forceLayout: true,
                                listeners:{
                                    afterlayout: function(){
                                        this.mapPanel = mapPanel.mapPanel;
                                        this.add({
                                            xtype : 'mxp_cmre_ondemand_services_input_form',
                                            layout:'fit',
                                            sdi2ManagerRestURL : me.osdi2ManagerRestURL,
                                            serviceId: serviceId,
								            serviceName: serviceName,
                                            auth : me.auth,
                                            mapPanel:mapPanel.mapPanel
                                        });
                                        
                                    }
                                },
							}],
                             region : "center",
							 sources: serverConfig.gsSources || {
                                
                                osm: { 
                                    "ptype": "gxp_osmsource"
                                }
                            },"map": {
                                maxResolution:156543.03390625,
                                numZoomLevels:20,
                                "projection": "EPSG:900913",
                                "units": "m",
                                "center": [0,0],
                                "zoom":3,
                                "maxExtent": [
                                    -20037508.34, -20037508.34,
                                    20037508.34, 20037508.34
                                ],
                                "layers": [
                                   {
                                        "source": "osm",
                                        "title": "Open Street Map",
                                        "name": "mapnik",
                                        "group": "background",
                                       isBaseLayer:true
                                    }
                                ]
                            }
                            
							
						}, -1, false, false);
                       
						
					} catch (e) {
						// FIXME: some error here
						console.log(e);
						console.log('Stack Trace: ' + e.stack);
					}
				}
			},
			icon : Ext.MessageBox.QUESTION
		});
	}
});

/** api: xtype = mxp_geobatch_consumer_grid */
Ext.reg(mxp.widgets.CMREOnDemandServicesGrid.prototype.xtype, mxp.widgets.CMREOnDemandServicesGrid);
