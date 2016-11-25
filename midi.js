var midi = {

	midiAcess:null,
	inputDeviceID:null,
	outputDeviceID:null,
	output:null,
	active: false,
	tempInstrument:null,
	deviceCount:0,

	connected: false,
	devices: {},
	deviceMapping: {},
	learn:false,
	learnSelected: {
		type: null,
		instrument: null,
		instrumentCount:null,
		controlID: null,
		controlType: null
	},

	init:function(){

		console.log('Starting MIDI....');

		function onMIDISuccess(midiAccess) {

			console.log('<===---MIDI INPUTS---===>');
			console.log(midiAccess.inputs);

			midi.connected = true;

			midi.midiAccess = midiAccess;

			var inputDeviceCount = midiAccess.inputs.size;
			var outputDeviceCount = midiAccess.outputs.size;

			midi.deviceCount = inputDeviceCount;

			//Loop through inputs
			var inputs=midiAccess.inputs.values();
			for(var input = inputs.next(); input && !input.done; input = inputs.next()){
				
				var deviceName = input.value.name;

				console.log('MIDI Device: ');
				console.log(input);
				
				//Add the midi devoce to the list of devices (if it is an input)
				if(input.value.type.toLowerCase() == 'input'){

					midi.devices[input.value.id] = {
						id: input.value.id,
						name: deviceName,
						state: input.value.state,
						connection: input.value.connection,
						enabled: 1
					};

					midi.deviceMapping[input.value.id] = {};

				}

		  	}	
			

			//Monitor input signals
		    var inputs = midiAccess.inputs.values();
		    for(var input = inputs.next(); input && !input.done; input = inputs.next()){
		    	input.value.onmidimessage = midi.midiMessage;
		    }

		    //Check local storage for saved device mappings
		    if(localStorage.getItem('midiDeviceMapping')){
		    	var storedDeviceMapping = localStorage.getItem('midiDeviceMapping');
		    	storedDeviceMapping = JSON.parse(storedDeviceMapping);

		    	midi.deviceMapping = storedDeviceMapping;

		    }

		}

		function onMIDIFailure(e) {
			midi.connected = false;
		    console.log("No access to MIDI devices or your browser doesn't support WebMIDI API. Please use WebMIDIAPIShim " + e);
		}

		if(navigator.requestMIDIAccess) {
			navigator.requestMIDIAccess({ sysex: false }).then(onMIDISuccess, onMIDIFailure);
		} else {
		    console.log("No MIDI support in your browser.");
		}


	},


	midiMessage: function(message){

		var deviceID = message.target.id;
		var data = message.data;
		
		var controlType = data[0];
		var controlID = data[1];
		var controlVal = data[2];

		console.log(controlID);

		//Only continues controllers allowed
		if(controlType != 176){
			return;
		}

		game.setPaddlePos(0,controlVal);

		

	},



}

midi.init();