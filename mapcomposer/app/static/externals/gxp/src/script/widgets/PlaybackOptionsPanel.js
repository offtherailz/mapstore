/**
 * Copyright (c) 2008-2011 The Open Planning Project
 * 
 * Published under the GPL license.
 * See https://github.com/opengeo/gxp/raw/master/license.txt for the full text
 * of the license.
 */

/**
 * @requires widgets/PlaybackToolbar.js
 * @requires widgets/form/PlaybackModeComboBox.js
 * @requires ../../../../openlayers/lib/OpenLayers/Control/TimeManager.js
 */

/** api: (define)
 *  module = gxp
 *  class = PlaybackOptionsPanel
 *  base_link = `Ext.Panel <http://extjs.com/deploy/dev/docs/?class=Ext.Panel>`_
 */
Ext.namespace("gxp");

/** api: constructor
 *  .. class:: PlaybackOptionsPanel(config)
 *   
 *      A panel for displaying and modifiying the configuration options for the PlaybackToolbar.
 */
gxp.PlaybackOptionsPanel = Ext.extend(Ext.Panel, {
    
    /** api: config[viewer]
     *  ``gxp.Viewer``
     */

    /** api: config[playbackToolbar]
     *  ``gxp.PlaybackToolbar``
     */
    
    /** api: config[timeManager]
     *  ``OpenLayers.Control.TimeManager``
     */
    
    layout: "fit",

    /** i18n */
    titleText: "Date & Time Options",
    rangeFieldsetText: "Time Range",
    animationFieldsetText: "Animation Options",
    startText:'Start',
    endText:'End',
    listOnlyText:'Use Exact List Values Only',
    stepText:'Animation Step',
    unitsText:'Animation Units',
    frameRateText:'Animation Delay (s)',
    noUnitsText:'Snap To Time List',
    loopText:'Loop Animation',
    reverseText:'Reverse Animation',
    rangeChoiceText:'Choose the range for the time control',
    rangedPlayChoiceText:'Playback Mode',
    
    /** private: method[initComponent]
     */
    initComponent: function() {
        var config = Ext.applyIf(this.initialConfig,{
            //minHeight:400,
            minWidth:275,
            ref:'optionsPanel',
            items:[
            {
                xtype: 'form',
                layout: 'form',
                autoScroll: true,
                ref:'form',
                border:false,
                bodyStyle: "padding: 10px",
                labelWidth:10,
                defaultType: 'textfield',
                items: [{
                    xtype: 'fieldset',
                    title: this.rangeFieldsetText,
                    defaultType: 'datefield',
                    labelWidth: 60,
                    items: [{
                        xtype: 'displayfield',
                        text: this.rangeChoiceText
                    }, {
                        fieldLabel: this.startText,
                        //format: "d-m-Y",  
                        listeners: {
                            'select': this.setStartTime,
                            'change': this.setStartTime,
                            scope: this
                        },
                        ref: '../../rangeStartField'
                    }, {
                        fieldLabel: this.endText,
                        //format: "d-m-Y",  
                        listeners: {
                            'select': this.setEndTime,
                            'change': this.setEndTime,
                            scope: this
                        },
                        ref: '../../rangeEndField'
                    }]
                }, {
                    xtype: 'fieldset',
                    title: this.animationFieldsetText,
                    labelWidth:120,
                    items: [
                   /* {
                      boxLabel:this.listOnlyText,
                      hideLabel:true,
                      xtype:'checkbox',
                      handler:this.toggleListMode,
                      scope:this,
                      ref:'../../listOnlyCheck'
                    },*/
                    {
                        fieldLabel: this.frameRateText,
                        xtype: 'numberfield',
                        anchor:'-25',
                        enableKeyEvents:true,
                        listeners: {
                            'change': this.setFrameRate,
                            scope: this
                        },
                        ref: '../../rateValueField'
                    },{
                        fieldLabel: this.stepText,
                        xtype: 'numberfield',
                        anchor:'-25',
                        enableKeyEvents:true,
                        listeners: {
                            'change': this.setStep,
                            scope: this
                        },
                        ref: '../../stepValueField'
                    }, {
                        fieldLabel: this.unitsText,
                        xtype: 'combo',
                        anchor:'-5',
                        //TODO: i18n these time units
                        store: [
                            [OpenLayers.TimeUnit.SECONDS,'Seconds'], 
                            [OpenLayers.TimeUnit.MINUTES,'Minutes'], 
                            [OpenLayers.TimeUnit.HOURS,'Hours'], 
                            [OpenLayers.TimeUnit.DAYS,'Days'], 
                            [OpenLayers.TimeUnit.MONTHS,"Months"], 
                            [OpenLayers.TimeUnit.YEARS,'Years']
                        ],
                        valueNotFoundText:this.noUnitsText,
                        mode:'local',
                        forceSelection:true,
                        autoSelect:false,
                        editable:false,
                        triggerAction:'all',
                        listeners: {
                            'select': this.setUnits,
                            scope: this
                        },
                        ref: '../../stepUnitsField'
                    },{
                        //TODO: provide user information about these modes (Change to radio group?)
                        fieldLabel:this.rangedPlayChoiceText,
                        xtype:'gxp_playbackmodecombo',
                        timeAgents: this.timeManager && this.timeManager.timeAgents,
                        anchor:'-5',
                        listeners:{
                            'modechange':this.setPlaybackMode,
                            scope:this
                        },
                        ref:'../../playbackModeField'
                    }]
                },
                {
                    xtype:'checkbox',
                    boxLabel:this.loopText,
                    handler:this.setLoopMode,
                    scope:this,
                    ref:'../loopModeCheck'
                }/*,
                {
                    xtype:'checkbox',
                    boxLabel:this.reverseText,
                    handler:this.setReverseMode,
                    scope:this,
                    ref:'../reverseModeCheck'
                }*/]
            }
            ],
            listeners:{'show':this.populateForm,scope:this},
            bbar: [{
                text: 'Save',
                iconCls:'save',
                handler: this.saveValues,
                scope: this
            }, {
                text: 'Cancel',
                iconCls:'cancel',
                handler: this.cancelChanges,
                scope: this
            }]
        });
        Ext.apply(this,config);
        gxp.PlaybackOptionsPanel.superclass.initComponent.call(this);
    },
    destroy:function(){
        this.timeManager = null;
        this.playbackToolbar = null;
        this.un('show',this,this.populateForm);
        gxp.PlaybackOptionsPanel.superclass.destroy.call(this);
    },
    setFrameRate: function(cmp,newVal,oldVal){
        this.timeManager.frameRate = newVal; 
        
    },    
    setStartTime: function(cmp, date){
        this.timeManager.setStart(date);
        this.timeManager.fixedRange=true;
        this.rangeEndField.setMinValue(date);
        
    },
    setEndTime:function(cmp,date){
        this.timeManager.setEnd(date);
        this.timeManager.fixedRange=true;
        this.rangeStartField.setMaxValue(date);
    },
    toggleListMode: function(cmp, checked){
        this.stepValueField.setDisabled(checked);
        this.stepUnitsField.setDisabled(checked);
        this.timeManager.snapToIntervals = checked;
    },
    setUnits:function(cmp,record,index){
        var units = record.get('field1');
        if(this.timeManager.units != units){
            this.timeManager.units = units;
            if(this.playbackToolbar.playbackMode != 'track'){
                this.timeManager.incrementTime();
                
                // prende la data di inizio e la data di fine del pannello
                // e invoca la funzione setRange di timeManager per ricalcolare i valori della slide
                this.timeManager.setRange([this.timeManager.range[0],this.timeManager.range[1]]);
                this.timeManager.fixedRange=true;             

            }
        }
    },
    setStep:function(cmp,newVal,oldVal){
        if(cmp.validate() && newVal){
            this.timeManager.step = newVal;
            if(this.playbackToolbar.playbackMode == 'range' && 
                this.timeManager.rangeInterval != newVal){
                    this.timeManager.rangeInterval = newVal;
                    this.timeManager.incrementTime(newVal);
                    
                    // prende la data di inizio e la data di fine del pannello
                    // e invoca la funzione setRange di timeManager per ricalcolare i valori della slide
                    this.timeManager.setRange([this.timeManager.range[0],this.timeManager.range[1]]);
                    this.timeManager.fixedRange=true;                              
                    
            }
        }
    },
    setPlaybackMode:function(cmp,mode,agents){
        switch(mode){
            case 'cumulative':
                this.playbackToolbar.setPlaybackMode('cumulative');
                break;
            case "range":
                this.disableListMode(true);
                this.playbackToolbar.setPlaybackMode("range");
                break;
            default:
                this.playbackToolbar.setPlaybackMode('track');
                break;
        }
        if(mode != "range"){
            this.disableListMode(false);
        }
    },
    disableListMode:function(state){
        var disable = state!==false;
        if (disable) {
            this.listOnlyCheck.setValue(!disable);
        }
        this.listOnlyCheck.setDisabled(disable);
    },
    setLoopMode:function(cmp,checked){
        this.timeManager.loop=checked;
    },
    setReverseMode:function(cmp,checked){
        this.timeManager.step *= -1;
    },
    populateForm: function(cmp){
        if (this.timeManager) {
            this.rangeStartField.setValue(this.timeManager.range[0]);
            this.rangeStartField.originalValue = this.timeManager.range[0];
            this.rangeEndField.setValue(this.timeManager.range[1]);
            this.rangeEndField.originalValue = this.timeManager.range[1];
            this.rateValueField.setValue(this.timeManager.frameRate);
            this.rateValueField.originalValue = this.timeManager.frameRate;
            this.stepValueField.setValue(this.timeManager.step);
            this.stepValueField.originalValue = this.timeManager.step;
            this.stepUnitsField.setValue(this.timeManager.units);
            this.stepUnitsField.originalValue = this.timeManager.units;
            // this.listOnlyCheck.setValue(this.timeManager.snapToIntervals);
            // this.listOnlyCheck.originalValue = this.timeManager.snapToIntervals;
            // var playbackMode = this.playbackToolbar.playbackMode;
			var playbackMode = 'range';
            if(playbackMode == 'track' || !playbackMode) { playbackMode = false; }
            if(!this.playbackModeField.timeAgents || !this.playbackModeField.timeAgents.length){
                this.playbackModeField.timeAgents = this.timeManager.timeAgents;
            }
            this.playbackModeField.setValue(playbackMode);
            this.playbackModeField.originalValue = playbackMode;
            this.loopModeCheck.setValue(this.timeManager.loop);
            this.loopModeCheck.originalValue=this.timeManager.loop;
            // this.reverseModeCheck.setValue(this.timeManager.step<0);
            // this.reverseModeCheck.originalValue=this.reverseModeCheck.getValue();
            //set min and max for not negative ranges.
            //this.rangeStartField.setMaxValue(this.timeManager.range[1]);
            //this.rangeEndField.setMinValue(this.timeManager.range[0]);
            //disable if range mode 
             /*if(playbackMode == "range"){
                this.listOnlyCheck.setDisabled(true);
            }*/
        }
    },
    saveValues:function(btn){
        if(this.ownerCt && this.ownerCt.close){
            this.ownerCt[this.ownerCt.closeAction]();
        }
    },
    cancelChanges: function(btn){
        this.form.getForm().items.each(function(field){
            field.setValue(field.originalValue);
        });
        
        this.saveValues();
    }
});

/** api: xtype = gxp_playbackoptions */
Ext.reg('gxp_playbackoptions', gxp.PlaybackOptionsPanel);
