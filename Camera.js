import '../assets/stylesheets/base.scss'
import React, { Component } from 'react'
import EXIF from 'exif-js'

var MobileDetect = require('mobile-detect'),
md = new MobileDetect(navigator.userAgent)



/*  
	-------------------------------------------------------------
	--------------------- Web Cam module ------------------------
	-------- works on both desktop and mobile browsers ----------
	-------------------------------------------------------------
	Renders a camera to take a picture
	After picture is taken, it calls this.props.photoTaken(canvas) 
	where canvas is a <canvas> with the image properly rotated
	To src of the image to display in an <img> call canvas.toDataURL("image/png")
	<Camera photoTaken={...}/>
*/
class Camera extends Component {

	componentWillMount(){
		this.setState({
			isIphone : md.is('iPhone')
		})
	}

	componentDidMount() {
		if (!this.state.isIphone) {
			this.recordVideo()
		}
	}


	/*  
		-------------------------------------------------------------
		----------------------- Show camera -------------------------
		-------------------------------------------------------------
	*/

	recordVideo() {
		var video = document.getElementById('video');

		// Get access to the camera!
		if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia ) {
			console.log(navigator.mediaDevices)
			console.log(navigator.mediaDevices.enumerateDevices())
		    
		    // Add `{ audio: true }` to access microphone too
		    navigator.mediaDevices.getUserMedia({ video: true }).then(function(stream) {
		        video.src = window.URL.createObjectURL(stream)
		        video.play()

		    }.bind(this))
		} else {
			console.log('no mediaDevices')
		}


		// // List cameras and microphones.
		// navigator.mediaDevices.enumerateDevices()
		// .then(function(devices) {
		//   devices.forEach(function(device) {
		//     console.log(device.kind + ": " + device.label +
		//                 " id = " + device.deviceId);
		//   });
		// })
		// .catch(function(err) {
		//   console.log(err.name + ": " + err.message);
		// });
	}


	openCamera() {
		var elem = document.getElementById("image-input");
		elem.click()
	}

/*  
	-------------------------------------------------------------
	----------------------- Take Picture ------------------------
	-------------------------------------------------------------
*/
	takePhotoMobile(event) {
		console.log('taking photo')
		if (event.target.files && event.target.files[0]) {
		    var reader = new FileReader(),
				can = document.createElement("canvas"),
				img = document.createElement('img'),
				ctx = can.getContext('2d'),
				orientation = 1

			img.onload = function() {
				can.height = img.height
				can.width = img.width
			    this.rotateCanvas(can, orientation)

				ctx.drawImage(img,0,0)
				this.props.photoTaken(can, orientation)
			}.bind(this)

			// reader to get orientation data
		    reader.onloadend = function() {
				console.log('reader-onload-end')
			    var exif = EXIF.readFromBinaryFile(this.base64ToArrayBuffer(reader.result))
			    orientation = exif.Orientation
				img.src = reader.result

			}.bind(this)

			reader.readAsDataURL(event.target.files[0])
		}
	}


	takePhotoDesktop() {
		var canvas = document.createElement("canvas"),//document.getElementById('img-holder'), //document.getElementById('canvas'),
			context = canvas.getContext('2d'),
			video = document.getElementById('video'),
		    video_height = video.getBoundingClientRect().height,
			video_width = video.getBoundingClientRect().width
				
		canvas.height = video_height
		canvas.width = video_width
		context.drawImage(video, 0, 0, video_width, video_height)

		this.props.photoTaken(canvas, null) 
	}


	/*  
		-------------------------------------------------------------
		------------- Image File Manipulation Functions ------------- 
		-------------------------------------------------------------
	*/

	base64ToArrayBuffer (base64) {
	    base64 = base64.replace(/^data\:([^\;]+)\;base64,/gmi, '');
	    var binaryString = atob(base64);
	    var len = binaryString.length;
	    var bytes = new Uint8Array(len);
	    for (var i = 0; i < len; i++) {
	        bytes[i] = binaryString.charCodeAt(i);
	    }
	    return bytes.buffer;
	}


	rotateCanvas(canvas, orientation) {
		var ctx = canvas.getContext('2d'),
			width  = canvas.width,
			styleWidth  = canvas.style.width,
	    	height = canvas.height,
	    	styleHeight = canvas.style.height
	    
		if (orientation > 4) {
			canvas.width  = height
			canvas.style.width  = styleHeight

			canvas.height = width
			canvas.style.height = styleWidth
		}

		switch(orientation){
			case 2: ctx.translate(width, 0);     ctx.scale(-1,1); break;
			case 3: ctx.translate(width,height); ctx.rotate(Math.PI); break;
			case 4: ctx.translate(0,height);     ctx.scale(1,-1); break;
			case 5: ctx.rotate(0.5 * Math.PI);   ctx.scale(1,-1); break;
			case 6: ctx.rotate(0.5 * Math.PI);   ctx.translate(0,-height); break;
			case 7: ctx.rotate(0.5 * Math.PI);   ctx.translate(width,-height); ctx.scale(-1,1); break;
			case 8: ctx.rotate(-0.5 * Math.PI);  ctx.translate(-width,0); break;
    
	    }
	    return canvas
	}

	/*  
		-------------------------------------------------------------
		---------------------- Render Functions --------------------- 
		-------------------------------------------------------------
	*/

	renderMobile(){
		return(
			<div className='vertical-container'>
				{this.state && this.state.image_taken ? 
					'' 
					: 
					<div className='img-container'>
						<img id='img-placeholder' src={require('./placeholder1.png')}/> 
					</div>
				}
		  		<div className='img-container'>
		  			<input id='image-input' type="file" name="image" accept="image/*" capture="user" onChange={this.takePhotoMobile.bind(this)}/>
		  		</div>

		  		<button className='pic-button' onClick={this.openCamera.bind(this)}> 
		  			{this.state && this.state.image_taken ? 'Change Photo' : 'Take Photo' } 
		  		</button>
		  	</div>
	  	)
	}


	renderDesktop() {
		return(
			<div className='vertical-container'>
				<div className='img-container'>
					<video id="video" />
				</div>
			
				<button className='pic-button' onClick={this.takePhotoDesktop.bind(this)}> 
					{this.state && this.state.image_taken ? 'Update Photo' : 'Take Photo' } 
				</button>
			</div>
		)
	}


	render() {
		return (
			<div id='camera-container' >
				{md.is('iPhone') ?
					this.renderMobile()
				:
					this.renderDesktop()
				}
			</div>

		)
	}

}

export default Camera;
