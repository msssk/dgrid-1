import { v } from '@dojo/widget-core/d';
import { theme, ThemeableMixin, ThemeableProperties } from '@dojo/widget-core/mixins/Themeable';
import WidgetBase from '@dojo/widget-core/WidgetBase';

import * as css from './styles/scrollbar.m.css';

export const ScrollbarBase = ThemeableMixin(WidgetBase);

export interface ScrollbarProperties extends ThemeableProperties {
	handleScroll?: (event: UIEvent) => void;
}

@theme(css)
class Scrollbar extends ScrollbarBase<ScrollbarProperties> {
	render() {
		const {
			handleScroll = () => true
		} = this.properties;

		return v('div', {
				classes: this.classes(css.scrollbar),
				onscroll: handleScroll
			}, [ v('div') ]
		);
	}
}

export default Scrollbar;
