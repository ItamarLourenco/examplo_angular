var app = angular.module('senac', ['ngRoute']); //Inicio o module e faço o registro na tag <html> em index.html.


app.factory("servicos", ['$http', function($http) { //Crio as chamadas para o servidor
    var serviceBase = 'services/'
    var obj = {};

    obj.getUsuarios = function(){
        return $http.get(serviceBase + 'usuarios');
    }

    obj.getUsuario = function(usuarioID){
        return $http.get(serviceBase + 'usuario?id=' + usuarioID);
    }

    obj.inserirUsuario = function (usuario) {
      return $http.post(serviceBase + 'inserirUsuario', usuario).then(function (results) {
        return results;
    });
	};

	obj.atualizarUsuario = function (id,usuario) {
	    return $http.post(serviceBase + 'atualizarUsuario', {id:id, usuario:usuario}).then(function (status) {
	        return status.data;
	    });
	};

	obj.deletarUsuario = function (id) {
	    return $http.delete(serviceBase + 'deletarUsuario?id=' + id).then(function (status) {
	        return status.data;
	    });
	};

  return obj;   

}]);

app.controller('usuarios', function ($scope, servicos) { //Crio o controller do usuários
    servicos.getUsuarios().then(function(data){ //Chamanda do main.html em $routerProvider
        $scope.usuarios = data.data;
    });
});


app.controller('editarUsuario', function ($scope, $rootScope, $location, $routeParams, servicos, usuario) { //Crio o controller para editar o usuário
    var usuarioID = ($routeParams.usuarioID) ? parseInt($routeParams.usuarioID) : 0;
    $rootScope.title = (usuarioID > 0) ? 'Editar Usuário' : 'Adicionar Usuário';
    $scope.buttonText = (usuarioID > 0) ? 'Atualizar Usuário' : 'Adicionar Novo usuário';

      var original = usuario.data;
      original._id = usuarioID;

      $scope.usuario = angular.copy(original);
      $scope.usuario._id = usuarioID;

      $scope.isClean = function() {
        return angular.equals(original, $scope.usuario);
      }

      $scope.deletarUsuario = function(usuario) {
        $location.path('/');
        if(confirm("Tem certeza que deseja deletar esse usuário?: "+$scope.usuario._id)==true)
        servicos.deletarUsuario(usuario.id);
      };

      $scope.salvarUsuario = function(usuario) {
        $location.path('/');
        if (usuarioID <= 0) {
            servicos.inserirUsuario(usuario);
        }
        else {
            servicos.atualizarUsuario(usuarioID, usuario);
        }
    };
});

app.config(['$routeProvider', //Configurando as rotas
  function($routeProvider) {
   $routeProvider.
      when('/', {
        title: 'Principal',
        templateUrl: 'partials/main.html',
        controller: 'usuarios'
      })

      .when('/editar-usuario/:usuarioID', {
        title: 'Editar Usuario',
        templateUrl: 'partials/editar-usuario.html',
        controller: 'editarUsuario',
        resolve: {
          usuario: function(servicos, $route){
            var usuarioID = $route.current.params.usuarioID;
            return servicos.getUsuario(usuarioID);
          }
        }
      })

      .otherwise({
        redirectTo: '/' //main.html
      });
}]);

app.run(['$location', '$rootScope', function($location, $rootScope) {
    $rootScope.$on('$routeChangeSuccess', function (event, current, previous) {
        $rootScope.title = current.$$route.title;
    });
}]);