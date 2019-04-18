document.addEventListener("DOMContentLoaded", function() { 
    var video = document.getElementById('video'), // Video
        captureCanvas = document.getElementById('captureCanvas'), // Canvas for captured photo
        uploadCanvas = document.getElementById('uploadCanvas'), // Canvas for uploaded photo
        captureContext = captureCanvas.getContext('2d'), // Context for captured photo canvas
        uploadContext = uploadCanvas.getContext('2d'), // Context for uploaded photo canvas
        uploadedPhoto = document.getElementById('uploadedPhoto'), // Uploaded photo ID
        capturedPhoto = document.getElementById('capturedPhoto'), // Captured Photo ID
        imageUploadInput = document.querySelector('[name="image-upload"]'), // Image Upload Input
        apiKey = '', // Facesoft API Key

        errorAlert = document.getElementById('errorAlert'), // Error Alert
        warningAlert = document.getElementById('warningAlert'), // Warning Alert
        matchText = document.getElementById('match'), // Match Text
        scoreText = document.getElementById('score'); // Score Text

    // Stream Camera To Video Element
    if(navigator.mediaDevices.getUserMedia){
        navigator.mediaDevices.getUserMedia({ video: true })
        .then(function(stream) {
            video.srcObject = stream;
        }).catch(function(error) {
            console.log(error)
        })
    }

    // On Upload Photo Button Click
    document.getElementById('upload').addEventListener('click', function(){
        imageUploadInput.click();
    })

    // On Uploaded Photo Change
    imageUploadInput.addEventListener('change', function(){
        // Get File Extension
        var ext = imageUploadInput.files[0]['name'].substring(imageUploadInput.files[0]['name'].lastIndexOf('.') + 1).toLowerCase();
        // If File Exists & Image
        if (imageUploadInput.files && imageUploadInput.files[0] && (ext == "png" || ext == "jpeg" || ext == "jpg")) {
            // Set Photo To Canvas
            var reader = new FileReader();
            reader.onload = function (e) {
                var img = new Image();
                img.src = event.target.result;
                img.onload = function() {
                    setImageToCanvas(img, uploadedPhoto, uploadCanvas, uploadContext);
                }
            }
            reader.readAsDataURL(imageUploadInput.files[0]);
        }  
    })

    // On Take Photo Button Click
    document.getElementById('capture').addEventListener('click', function(){
        setImageToCanvas(video, capturedPhoto, captureCanvas, captureContext, video.videoWidth, video.videoHeight);
    })

    // On Verify Photo Button Click
    document.getElementById('verify').addEventListener('click', function(){
        // Remove Results & Alerts
        errorAlert.style.display = "none";
        warningAlert.style.display = "none";
        matchText.innerHTML = "";
        scoreText.innerHTML = "";

        // Get Base64
        var image1 = captureCanvas.toDataURL().split(',')[1]; // Split to get ASCII
        var image2 = uploadCanvas.toDataURL().split(',')[1]; // Split to get ASCII

        // Verify if images are of the same person
        verifyImages(image1, image2, function(response){
                if(response){
                    var obj = JSON.parse(response);

                    // If Warning Message
                    if(obj.message){
                        errorAlert.style.display = "none";
                        warningAlert.style.display = "block";
                        warningAlert.innerHTML = obj.message;
                        matchText.innerHTML = "";
                        scoreText.innerHTML = "";
                    }
                    // If Error
                    else if(obj.error){
                        errorAlert.style.display = "block";
                        errorAlert.innerHTML = obj.error;
                        warningAlert.style.display = "none";
                        matchText.innerHTML = "";
                        scoreText.innerHTML = "";
                    }
                    // If Valid
                    else{
                        errorAlert.style.display = "none";
                        warningAlert.style.display = "none";
                        matchText.innerHTML = obj.match;
                        scoreText.innerHTML = (obj.score*100).toFixed(2) + "% Score";
                    }
                }
            })
    })

    // Set Photo To Canvas Function
    function setImageToCanvas(image, id, canvas, context, width=image.width, height=image.height) {
        var ratio = width / height;
        var newWidth = canvas.width;
        var newHeight = newWidth / ratio;
        if (newHeight > canvas.height) {
            newHeight = canvas.height;
            newWidth = newHeight * ratio;
        }
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(image, 0, 0, newWidth, newHeight);
        id.setAttribute('src', canvas.toDataURL('image/png'));
    }

    // Facesoft Face Match API Function
    function verifyImages(image1, image2, callback){
        var params = {
            image1: image1,
            image2: image2,
        }
        var xhr = new XMLHttpRequest();
            xhr.open("POST", "https://api.facesoft.io/v1/face/match");
            xhr.setRequestHeader("apikey", apiKey);
            xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
            xhr.onload = function(){
                callback(xhr.response);
            }
            xhr.send(JSON.stringify(params));
    }


    // Set Default Images For Uploaded & Captured Photo
    setImageToCanvas(uploadedPhoto, uploadedPhoto, uploadCanvas, uploadContext);
    setImageToCanvas(capturedPhoto, capturedPhoto, captureCanvas, captureContext);
});