import { v } from '@dojo/widget-core/d';
import { theme, ThemeableMixin, ThemeableProperties } from '@dojo/widget-core/mixins/Themeable';
import WidgetBase from '@dojo/widget-core/WidgetBase';

import * as css from './styles/scrollbar.m.css';

export const ScrollbarBase = ThemeableMixin(WidgetBase);

export interface ScrollbarProperties extends ThemeableProperties { }

@theme(css)
class Scrollbar extends ScrollbarBase<ScrollbarProperties> {
	render() {
		return v('div', {
				classes: this.classes(css.scrollbar)
			}
		);
	}
}

export default Scrollbar;
