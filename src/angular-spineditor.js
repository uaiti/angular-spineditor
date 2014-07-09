angular.module('ng.spineditor', [])
	.constant('spinConfig', {
		minimum: "1",
		maximum: "1000",
		step: "1",
		decimals: "2",
		prefix: "",
		postfix: "",
		class: "",
		style: "",
		storeFloat: false
	})
	.controller('SpineditorCtrl', ['$scope', '$filter', '$attrs', function($scope, $filter, $attrs) {
		var self = this;
		$scope.config = {};
		$scope.spinValue = 0;

		this.init = function(config_) {
			$scope.config = config_;
			$scope.spinValue = $scope.ngModel;
		};

		// called when the value in the fields is changed
		this.changeSpin = function(value) {
			var floatvalue = $filter('float')(value);
			value = $filter('number')(floatvalue, $scope.config.decimals);
			$scope.spinValue = value;
			if ($scope.config.storeFloat) {
				$scope.ngModel = floatvalue;
			} else {
				$scope.ngModel = value;			
			}
		};

		// increments the field's value
		$scope.spinUp = function() {
			var value = $filter('float')($scope.ngModel);
			var new_value = value + parseFloat($scope.config.step);

			if (new_value > $scope.config.maximum) {
				return;
			}
			
			self.changeSpin(new_value);
		};

		// decrements the field's value
		$scope.spinDown = function() {
			var value = $filter('float')($scope.ngModel);
			var new_value = value - parseFloat($scope.config.step);

			if (new_value < $scope.config.minimum) {
				return;
			}
			
			self.changeSpin(new_value);
		};

		// called when the user leaves the field
		$scope.spinBlur = function() {
			self.changeSpin($scope.spinValue);
		};
	}])
	.directive('spineditor', ['spinConfig', function(spinConfig) {
		return {
			restrict: 'E',
			controller: 'SpineditorCtrl',
			replace : true,
			transclude: false,
			scope: {
			  ngModel: '=',
			},
			template: 
				'<div class="input-group angular-spineditor input-group-sm">' +
					'<span class="input-group-addon angular-spineditor-prefix" ng-if="config.prefix">{{config.prefix}}</span>' +
					'<input type="text" class="form-control input-sm {{config.class}}"' +
						'id="{{config.id}}" style="{{config.style}}" ng-model="spinValue" ng-blur="spinBlur()" /> '+
					'<span class="input-group-addon angular-spineditor-postfix" ng-if="config.postfix">{{config.postfix}}</span>' +
					'<span class="input-group-btn-vertical">' +
						'<button class="btn btn-default angular-spineditor-up" type="button" ng-click="spinUp()">' +
							'<i class="glyphicon glyphicon-chevron-up"></i>' +
						'</button>' +
						'<button class="btn btn-default angular-spineditor-down" type="button" ng-click="spinDown()">' +
							'<i class="glyphicon glyphicon-chevron-down"></i>' +
						'</button>' +
					'</span>' +
				'</div>',
			link: function spinLink(scope, element, attrs, controller) {
				var config = {};
				angular.forEach(['minimum', 'maximum', 'step', 'decimals', 'prefix', 'postfix', 'class', 'style', 'storeFloat'], function(key) {
					config[key] = angular.isDefined(attrs[key])   ? attrs[key]   : spinConfig[key];
				});
				// decimals can be decimals or numberofdecimals
				angular.isDefined(attrs.numberofdecimals) ? config.decimals = attrs.numberofdecimals : null;

				controller.init(config);

				var input = element.find('input');
				// makes the text to be selected when focused
				input.on('focus', function() {
					var that = this;
					setTimeout(function() {
						that.setSelectionRange(0, 5)
					}, 100);
				});
			}
		}
	}])
	/**
	 * Converts a formated number to float, independent of the locale format
	 */
	.filter('float', function() {
		return function floatFilter (input) {
			input = input.toString();
			var itens = input.split(/(\.|,)/g);
			var input_parts = [];
			for (var i = 0, cnt = itens.length; i < cnt; i++) {
				if (itens[i] != ',' && itens[i] != '.')
					input_parts.push(itens[i]);
			}
			var final = '';
			for (i = 0, cnt = input_parts.length - 1; i < cnt || i == 0; i++) {
				final += input_parts[i];
			}
			if (input_parts.length > 1) {
				final += "." + input_parts[input_parts.length - 1];
			}
			return parseFloat(final);
		};
	});
