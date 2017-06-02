import { v, w } from '@dojo/widget-core/d';
import { WidgetProperties } from '@dojo/widget-core/interfaces';
import { ProjectorMixin } from '@dojo/widget-core/mixins/Projector';
import { WidgetBase } from '@dojo/widget-core/WidgetBase';
import Grid from '../src/Grid';
import ArrayDataProvider from '../src/providers/ArrayDataProvider';

const data = [
	{ order: 1, name: 'preheat', description: 'Preheat your oven to 350F' },
	{ order: 2, name: 'mix dry', description: 'In a medium bowl, combine flour, salt, and baking soda' },
	{ order: 3, name: 'mix butter', description: 'In a large bowl, beat butter, then add the brown sugar and white sugar then mix' },
	{ order: 4, name: 'mix together', description: 'Slowly add the dry ingredients from the medium bowl to the wet ingredients in the large bowl, mixing until the dry ingredients are totally combined' },
	{ order: 5, name: 'chocolate chips', description: 'Add chocolate chips' },
	{ order: 6, name: 'make balls', description: 'Scoop up a golf ball size amount of dough with a spoon and drop in onto a cookie sheet' },
	{ order: 7, name: 'bake', description: 'Put the cookies in the oven and bake for about 10-14 minutes' },
	{ order: 8, name: 'remove', description: 'Using a spatula, lift cookies off onto wax paper or a cooling rack' },
	{ order: 9, name: 'eat', description: 'Eat and enjoy!' }
];
const gridData = [];

for (let i = 1; i <= 100; i++) {
	gridData.push({
		order: i,
		name: data[Math.floor(Math.random() * data.length)].name,
		description: data[Math.floor(Math.random() * data.length)].description
	});
}

const dataProvider = new ArrayDataProvider({
	idProperty: 'order',
	data: gridData
});

const columns = [
	{
		id: 'order',
		label: 'step' // give column a custom name
	},
	{
		id: 'name'
	},
	{
		id: 'description',
		label: 'what to do',
		sortable: false
	}
];

const ProjectorBase = ProjectorMixin(WidgetBase);

class Projector extends ProjectorBase<WidgetProperties> {
	render() {
		return v('div', {
			styles: {
				width: '1100px'
			}
		}, [
			w(Grid, {
				dataProvider,
				columns
			}),
			v('form', {
				id: 'configform'
			}, [
				'Scroll synchronization: ',
				v('label', [
					v('input', {
						type: 'radio',
						name: 'scrollsync',
						value: 'enabled',
						checked: true
					}),
					'Enabled'
				]),
				v('label', [
					v('input', {
						type: 'radio',
						name: 'scrollsync',
						value: 'disabled'
					}),
					'Disabled'
				])
			])
		]);
	}
}

const projector = new Projector();

projector.append();

setTimeout(function () {
	const gridNode = <HTMLElement> document.querySelector('[role="grid"]');
	gridNode.style.position = 'relative';

	const bodyNode = <HTMLElement> gridNode.children[1];
	bodyNode.style.overflowY = 'scroll';
	bodyNode.style.overflowX = 'hidden';

	setTimeout(function () {
		const scrollbarNode = document.createElement('div');

		scrollbarNode.style.height = bodyNode.offsetHeight + 'px';
		scrollbarNode.style.overflowX = 'hidden';
		scrollbarNode.style.overflowY = 'scroll';
		scrollbarNode.style.position = 'absolute';
		scrollbarNode.style.right = '0';
		const headerNode = <HTMLElement> gridNode.firstElementChild;
		scrollbarNode.style.top = headerNode.offsetHeight + 'px';
		const scrollbarWidth = bodyNode.offsetWidth - bodyNode.clientWidth;
		scrollbarNode.style.width = (scrollbarWidth + 1) + 'px';
		bodyNode.style.width = (gridNode.clientWidth - scrollbarWidth) + 'px';
		const contentNode = <HTMLElement> bodyNode.firstElementChild;
		const contentWidth = gridNode.clientWidth - scrollbarWidth + 1;
		contentNode.style.width = contentWidth + 'px';
		headerNode.style.width = contentWidth + 'px';

		const scrollHeightNode = document.createElement('div');
		scrollHeightNode.style.height = bodyNode.scrollHeight + 'px';
		scrollHeightNode.style.width = '100%';
		scrollbarNode.appendChild(scrollHeightNode);
		gridNode.appendChild(scrollbarNode);


		let contentScrollPauseCounter = 0;
		let scrollerScrollPauseCounter = 0;

		function handleContentScroll (event: Event) {
			if (contentScrollPauseCounter) {
				contentScrollPauseCounter--;
				return;
			}

			scrollerScrollPauseCounter++;
			scrollbarNode.scrollTop = (<HTMLElement> event.target).scrollTop;
		}

		function handleScrollerScroll (event: Event) {
			if (scrollerScrollPauseCounter) {
				scrollerScrollPauseCounter--;
				return;
			}

			contentScrollPauseCounter++;
			bodyNode.scrollTop = (<HTMLElement> event.target).scrollTop;
		}

		function disableScrollSync () {
			bodyNode.removeEventListener('scroll', handleContentScroll);
			scrollbarNode.removeEventListener('scroll', handleScrollerScroll);
		}

		function enableScrollSync () {
			bodyNode.addEventListener('scroll', handleContentScroll);
			scrollbarNode.addEventListener('scroll', handleScrollerScroll);
		}

		enableScrollSync();

		document.getElementById('configform')!.addEventListener('change', function (event: Event) {
			const radio = <HTMLFormElement> event.target;

			if (radio.value === 'disabled') {
				disableScrollSync();
			}
			else {
				enableScrollSync();
			}
		});
	});
}, 500);
