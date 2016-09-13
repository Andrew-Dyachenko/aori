angular.module('aori', ['ui.bootstrap'])
.directive('pieChart', function () {
	return function (scope, element, attributes) {
		var attrValue = attributes.pieChart,				// Значение атрибута (ordered-list='items')
			claim = scope[attrValue],						// Значение из scope (scope[items])
			data = [],					 					// Массив чисел для диаграммы, по одному для каждого сектора
			width = 16,										// Ширина SVG-изображения в пикселах
			height = 16,									// Высота SVG-изображения в пикселах
			cx = 0,											// Координата центра по оси X
			cy = 0,											// Координата центра по оси Y
			r = 8,											// Радиус диаграммы
			colors = [],									// Массив цветов в формате HTML, по одному для каждого сектора
			svgns = 'http://www.w3.org/2000/svg',			// Пространство имен XML для элементов svg var svgns = 'http://www.w3.org/2000/svg';
			total = 0,										// Общая сумма диаграммы
			angles = [],									// Радиально - секторальный массив чисел
			startangle = 0,									// Начальный угол рисования
			key, key2, i;									// Общие итераторы

		// Поиск подходящего цвета из заложенной в моделе библиотеки
		for (key in claim.moderators) {
			for (key2 in scope.mdrData.colors) {
				if (claim.moderators[key].status === key2) {
					colors.push(scope.mdrData.colors[key2]);
				}
			}
		}

		/*---------------------------------------------------------------
		Создать элемент <svg> указать размеры для в пикселах и координаты
		---------------------------------------------------------------*/
		var chart = document.createElementNS(svgns, 'svg:svg');
		chart.setAttribute('width', width);
		chart.setAttribute('height', height);
		chart.setAttribute('viewBox', '' + (width / -2) + '' + (height / -2) + ' ' + width + ' ' + height);
		/*-------------------------------------------------------------*/

		// Извлечение чисел для диаграммы из объекта
		for (key in claim.moderators)
			data.push(claim.moderators[key].value);

		// Сложить вместе все значения, чтобы получить общую сумму всей диаграммы
		for (i = 0; i < data.length; i++)
			total += data[i];

		// Определить величину каждого сектора. Углы измеряются в радианах
		for (i = 0; i < data.length; i++)
			angles[i] = data[i] / total * Math.PI * 2;

		// Цикл по всем секторам диаграммы
		for (i = 0; i < data.length; i++) {
			var endangle = startangle + angles[i],	// Точка, где заканчивается сектор
				/*-------------------------------------------------------------------
				Вычислить координаты точек пересечения радиусов, образующих сектор
				с окружностью. В соответствии с выбранными формулами углу 0 радиан
				соответствует точка в самой верхней части окружности,
				а положительные значения откладываются от нее по часовой стрелке.
				-------------------------------------------------------------------*/
				x1 = cx + r * Math.sin(startangle),
				y1 = cy - r * Math.cos(startangle),
				x2 = cx + r * Math.sin(endangle),
				y2 = cy - r * Math.cos(endangle),
				/*-----------------------------------------------------------------*/
				
				big = 0;	// Это флаг для углов, больших половины окружности. Он необходим SVG-механизму рисования дуг
			if (endangle - startangle > Math.PI)
				big = 1;

			console.debug('x1: ', x1, 'y1: ', y1, 'x2: ', x2, 'y2: ', y2);

			// Описание svg сектора, с индексом i, с помощью элемента <svg:path>
			var path = document.createElementNS(svgns, 'path'),
				d = 'M ' + cx + ',' + cy +
				' L ' + x1 + ',' + y1 +
				' A ' + r + ',' + r +
				' 0 ' + big + ' 1 ' +
				x2 + ',' + y2 +
				' Z';

			// Теперь установить атрибуты элемента <svg:path>
			path.setAttribute('d', d);             		// Установить описание контура
			path.setAttribute('fill', colors[i]);   	// Установить цвет сектора
			path.setAttribute('stroke', '#000');   	// Рамка сектора - черная
			path.setAttribute('stroke-width', '0'); 	// Толщина рамки
			chart.appendChild(path);              			// Добавить в диаграмму  

			startangle = endangle;
		}
		element.append(chart);
	};
})
.controller('navigationController', function ($scope) {
	$scope.navs = [
		[
			{
				glyphicon: 'glyphicon-inbox',
				text:'Группы объявлений',
				readedMessages: 8,
				unreadMessages: 2
				
			},
			{
				glyphicon: 'glyphicon-list-alt',
				text:'Объявления',
				readedMessages: 48,
				unreadMessages: 15
				
			},
			{
				glyphicon: 'glyphicon-text-color',
				text:'Ключевые слова',
				readedMessages: 150,
				unreadMessages: 5
				
			}
		],
		[
			{
				glyphicon: 'glyphicon-stats',
				text:'Статистика'
				
			},
			{
				glyphicon: 'glyphicon-cog',
				text:'Настройки компании'
				
			}
		]
	];
})

.controller('moderationController', function ($scope) {
	$scope.filtered = $scope.claims;
	$scope.mdrData = {
		colors: {
			approved: '#1aa033',
			moderation: '#eada22',
			rejected: '#ea2f2f'
		},
		claims: [
			{
				name: 'Детские брюки',
				moderators: {
					facebook: {
						status: 'rejected',
						value: 1
					},
					vkontakte: {
						status: 'moderation',
						value: 1
					},
					target: {
						status: 'approved',
						value: 1
					}
				}
			},
			{
				name: 'Верхняя одежда',
				moderators: {
					facebook: {
						status: 'approved',
						value: 1
					},
					vkontakte: {
						status: 'rejected',
						value: 1
					},
					target: {
						status: 'moderation',
						value: 1
					}
				}
			},
			{
				name: 'Летняя одежда',
				moderators: {
					facebook: {
						status: 'approved',
						value: 1
					},
					vkontakte: {
						status: 'moderation',
						value: 1
					},
					target: {
						status: 'approved',
						value: 1
					}
				}
			},
			{
				name: 'Детские толстовки',
				moderators: {
					facebook: {
						status: 'rejected',
						value: 1
					},
					vkontakte: {
						status: 'rejected',
						value: 1
					},
					target: {
						status: 'approved',
						value: 1
					}
				}
			},
			{
				name: 'Джинсы',
				moderators: {
					facebook: {
						status: 'rejected',
						value: 1
					},
					vkontakte: {
						status: 'moderation',
						value: 1
					},
					target: {
						status: 'moderation',
						value: 1
					}
				}
			},
			{
				name: 'Джинсовые шорты',
				moderators: {
					facebook: {
						status: 'rejected',
						value: 1
					},
					vkontakte: {
						status: 'moderation',
						value: 1
					},
					// target: {
					// 	status: 'approved',
					// 	value: 1
					// }
				}
			},
			{
				name: 'Обувь для детей',
				moderators: {
					facebook: {
						status: 'approved',
						value: 1
					},
					vkontakte: {
						status: 'approved',
						value: 1
					},
					target: {
						status: 'approved',
						value: 1
					}
				}
			},
			{
				name: 'Для самых маленьких',
				moderators: {
					// facebook: {
					// 	status: 'rejected',
					// 	value: 1
					// },
					// vkontakte: {
					// 	status: 'moderation',
					// 	value: 1
					// },
					// target: {
					// 	status: 'approved',
					// 	value: 1
					// }
				}
			}
		]
	};
});