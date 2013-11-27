$(function(){
	var promedio_irca = 0;
	createPie = function (val){

      resto = 100 - val;
        var testdata = [
	        { 
	          key: "One",
	          y: val
	        },
	        {
	            key: "Six",
	            y: resto
	        }
      	];


      nv.addGraph(function() {
      /*    var width = 150,
              height = 150;*/
      
              var width = $("#ircaContainer").width(),
              height = $("#ircaContainer").height();


              /*var width = nv.utils.windowSize().width - 40,
              height = nv.utils.windowSize().height / 2 - 40;*/

		
          var chart = nv.models.pie()
              .values(function(d) { return d })
              .width(width)
              .height(height)
              .donut(true);

          d3.select("#irca_svg")
              .datum([testdata])
            .transition().duration(1200)
              .attr('width', width)
              .attr('height', height)
              .call(chart);

          return chart;
      });

    }
	
	createPie(promedio_irca);
    
    window.onresize = function(event) {
      $("#ircaContainer svg").html("");
      createPie(promedio_irca);
    }
	hostServer = 'http://174.129.225.176:80'
    connected = false;

    var socket = null;
    try{
        socket = io.connect(hostServer);
    } catch(err){
        connected = false;
        //setTimeout(function(){window.location.reload()},3000)
    }

     		$('#file').bootstrapFileInput();

            $('#formFoto').submit(function(e){

                  var file = $('#file')[0].files[0],
                  reader = new FileReader();
                  reader.onload = function(evt){
                      console.log(evt)

                    data = {
                        departamento: $("#listDepartments").val(),
                        municipio: $("#listMunicipalities").val(),
                        email: $("#email").val(),
                        base64Image: evt.target.result,
                        message:$("#title").val(),
                        type:"Image"
                    }

	                $("#email").val("");
		            $("#title").val("");
		            $("#file").val("");

		            $("#sendFormFoto").hide();

	                setTimeout(function(){
					  $("#sendFormFoto").show();
					}, 2000);

                    socket.emit('sendMessage', data);
                  };
                  reader.readAsDataURL(file);  
                  return false;
            });


            $("#formMensaje").submit(function(){

                data = {
                  departamento: $("#listDepartments").val(),
                  municipio: $("#listMunicipalities").val(),
                  email: $("#correo").val(),
                  base64Image: undefined,
                  message:$("#textMensaje").val(),
                  type:"Message"
                }

                $("#correo").val("");
                $("#textMensaje").val("");

                $("#sendFormMensaje").hide();

                setTimeout(function(){
				  $("#sendFormMensaje").show();
				}, 2000);


                socket.emit('sendMessage', data);
                return false;
            })



	socket.on('connect', function () {
        connected = true;
        console.log("Conectado");
        funciones.list_departments();
    });
    socket.on('error', function (reason){
        connected = false;
        console.error('Unable to connect Socket.IO', reason);
        //$.mobile.navigate("#tryconnect");
    });
    socket.on('disconnect', function () {
        connected = false;
        //$.mobile.navigate("#tryconnect");
    });

	var funciones = {
        list_departments:function(){
            socket.emit('list_departments')
        },list_municipality:function(department){
        	socket.emit('list_municipality',{"department":department})        	
        },dataSummary:function(department,municipality){
        	socket.emit('dataSummary',{"department":department,"municipality":municipality})
        }
    }

    socket.on('list_departments',function (dataDepartments) {
    	$.each(dataDepartments["departments"],function(index, value){
                var option = '<option value="' + value + '">' + value + '</option>';
                //var checkbox = '<input type="checkbox" name="'+ value + '" id="' + value + '" value="' + value + '"/> <label for="' + value  + '">' + value + '</label>';                console.log(checkbox);
                $("#listDepartments").append(option);
            });
    	$("#listDepartments").change();        
    });

    $("#listDepartments").change(function() {
    	var department = $("#listDepartments").val();
    	if(department != ""){
    		$("#listMunicipalities").empty();
    		funciones.list_municipality(department);
    	}
	});

	socket.on('list_municipality', function (dataMunicipalities) {		
    	$.each(dataMunicipalities["municipios"],function(index, value){
                var option = '<option value="' + value + '">' + value + '</option>';
                //var checkbox = '<input type="checkbox" name="'+ value + '" id="' + value + '" value="' + value + '"/> <label for="' + value  + '">' + value + '</label>';                console.log(checkbox);
                $("#listMunicipalities").append(option);
            });
    	$("#listMunicipalities").change();
    });

    $("#listMunicipalities").change(function() {
    	var department = $("#listDepartments").val();
    	var municipality = $("#listMunicipalities").val();
    	if(department != ""){    		
    		funciones.dataSummary(department,municipality);
    	}

    	$("#zona").html("<b> (" + department + " - " +municipality+" )</b>")
	});


	socket.on('showMessage',function(message){

		var created = Date.now();
		if(message.created !=undefined){
			created = message.created;
		}
		if(message.type == "Message" )
			$("#messages").append('<a href="#" class="list-group-item"><h4 class="list-group-item-heading">'+message.departamento+' - ' +message.municipio+ '<span style="text-align:right;position: absolute;right: 10px;style="font-size:8px;"">['+created+']</span></h4><div class="columnsText" style="text-align: justify;text-align: justify;"><p>'+message.message+'</p></div></a>');
		else if(message.type == "Image")
			$("#messages").append('<a href="#" class="list-group-item"><h4 class="list-group-item-heading">'+message.departamento+' - ' +message.municipio+ '<span style="text-align:right;position: absolute;right: 10px;style="font-size:8px;"">['+created+']</span></h4><div class="columnsText" style="text-align: justify;text-align: justify;"><img src="'+message.base64Image+'" style="float:left;margin-right:20px;width:50%;"><p>'+message.message+'</p></div></a>');


		//$("#messages").append("<div><h3>"+message.departamento+" - "+message.municipio+"</h3><p>"+message.message+"</p></div>");
		//$("#messages").append("<div><h3>"+message.departamento+" - "+message.municipio+"</h3><p>"+message.message+"<br> <Image width='30%' src='"+message.base64Image+"'></p></div>");
	
	})
	socket.on('dataSummary', function (dataSummary){		
		var ircap = dataSummary["ircap"];
		if(ircap == ""){
			promedio_irca = 0;			
			$("#detailWater").html("")
			$("#noInfoWater").html("No info Agua");
		}else{
			ircap = ircap[0]
			$("#noInfoWater").html("");
			$("#dataWater").html("")

			nivel_de_riesgo = ircap["nivel_de_riesgo"]
			promedio_irca = parseInt(ircap["promedio_irca"])
			ano = ircap["ano"]			

			$("#dataWater").html(promedio_irca)
			$("#detailWater").html(nivel_de_riesgo + " ("+ano+")")
			/*
			PartitionKey: "7FFFBA2B-5837-462D-94FA-EACECBAE8EF5"
			RowKey: "DC03E089-3DBA-4437-BDA9-FCBBAE776FEE"
			__v: 0
			_id: "52950c6f8ac1e9fb2c0003ec"
			ano: 2012
			departamento: "Antioquia"
			municipio: "Betulia"
			nivel_de_riesgo: "BAJO"
			numero_de_muestras: 8
			promedio_irca: 13.83
			*/
		}


		createPie(promedio_irca)

		var enfermedadMunicipio = dataSummary["EnfermedadMunicipio"]
		if(enfermedadMunicipio != ""){
			$("#noInfoIllnesses").html("")
			$.each(enfermedadMunicipio,function(index, value){			
				var evento = value["evento"];
				var totalcasos = 0;
				if(value["totalcasos"] != ""){
					totalcasos = value["totalcasos"];
				}
				$("#topIllnesses ul").html("")
				var li = '<li class="list-group-item"><span class="badge">' + totalcasos + '</span>' + evento + '</li>'
				$("#topIllnesses ul").append(li);
			});		
		}else{
			$("#topIllnesses ul").html("");
			$("#noInfoIllnesses").html("No info enfermedades");
		}

		
		/*
			PartitionKey: "712323EF-16F0-4E55-8C58-CA3377CF5B2C"
			RowKey: "95FB1E32-C5D9-4FBF-83F9-F1CBAC4564C0"
			__v: 0
			_id: "52950c6e8ac1e9fb2c00012d"
			departamento: "AMAZONAS"
			evento: "AGRESIONES POR ANIMALES POTENCIALMENTE TRANSMISORES DE RABIA"
			municipio: "PUERTO NARIÑO"
			totalcasos: 13
		*/


		var json_data = {
			department:$("#listDepartments").val(),
			municipio:$("#listMunicipalities").val()
		};
		socket.emit('listMessages',json_data);

	});



});