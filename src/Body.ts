import { v, w } from '@dojo/widget-core/d';
import { RegistryMixin, RegistryMixinProperties } from '@dojo/widget-core/mixins/Registry';
import { theme, ThemeableMixin, ThemeableProperties } from '@dojo/widget-core/mixins/Themeable';
import WidgetBase from '@dojo/widget-core/WidgetBase';
import { HasColumns, HasItems } from './interfaces';
import Row from './Row';

import * as bodyClasses from './styles/body.m.css';

export const BodyBase = ThemeableMixin(RegistryMixin(WidgetBase));

export interface BodyProperties extends ThemeableProperties, HasColumns, HasItems, RegistryMixinProperties { }

@theme(bodyClasses)
class Body extends BodyBase<BodyProperties> {
	render() {
		const {
			columns,
			items,
			registry,
			theme
		} = this.properties;

		return v('div', {
				afterCreate: function (element: HTMLElement) {
					let scrollbarWidth = element.offsetWidth - element.clientWidth;

					if (!scrollbarWidth) {
						scrollbarWidth = 7;
					}

					scrollbarWidth += 1;

					const widthString = scrollbarWidth + 'px';
					let scrollbarNode = <HTMLElement> element.previousElementSibling;
					scrollbarNode.style.width = widthString;
					let scrollHeaderNode = <HTMLElement> scrollbarNode.previousElementSibling;
					scrollHeaderNode.style.width = widthString;
					scrollbarNode.style.top = scrollHeaderNode.offsetHeight + 'px';
					let gridNode = <HTMLElement> scrollbarNode.parentElement;
					// gridNode does not yet have CSS applied so wait until it has correct height
					setTimeout(function () {
						scrollbarNode.style.height = (gridNode.offsetHeight - scrollHeaderNode.offsetHeight) + 'px';
					});
				},
				classes: this.classes(bodyClasses.scroller)
			},
			[
				v('div', {
					classes: this.classes(bodyClasses.content)
				},
				items.map((item) => {
					return w<Row>('row', {
						columns,
						item,
						key: item.id,
						registry,
						theme
					});
				}))
			]
		);
	}
}

export default Body;
