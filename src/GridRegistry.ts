import { WidgetBaseConstructor } from '@dojo/widget-core/interfaces';
import WidgetRegistry from '@dojo/widget-core/WidgetRegistry';
import Body, { BodyProperties } from './Body';
import Cell, { CellProperties } from './Cell';
import Footer, { FooterProperties } from './Footer';
import Header, { HeaderProperties } from './Header';
import HeaderCell, { HeaderCellProperties } from './HeaderCell';
import Row, { RowProperties } from './Row';
import Scrollbar, { ScrollbarProperties } from './Scrollbar';

export interface GridRegistered {
	[key: string]: WidgetBaseConstructor;
	body: WidgetBaseConstructor<BodyProperties>;
	cell: WidgetBaseConstructor<CellProperties>;
	footer: WidgetBaseConstructor<FooterProperties>;
	header: WidgetBaseConstructor<HeaderProperties>;
	'header-cell': WidgetBaseConstructor<HeaderCellProperties>;
	row: WidgetBaseConstructor<RowProperties>;
	scrollbar: WidgetBaseConstructor<ScrollbarProperties>;
}

export default class GridRegistry<T extends GridRegistered = GridRegistered> extends WidgetRegistry {
	private _overrides: WidgetRegistry = new WidgetRegistry();

	constructor() {
		super();

		super.define('body', Body);
		super.define('cell', Cell);
		super.define('footer', Footer);
		super.define('header', Header);
		super.define('header-cell', HeaderCell);
		super.define('row', Row);
		super.define('scrollbar', Scrollbar);
	}

	define<K extends keyof T>(widgetLabel: K, registryItem: T[K]): void {
		this._overrides.define(widgetLabel, registryItem);
	}

	get<K extends keyof T>(widgetLabel: K): T[K] {
		return <WidgetBaseConstructor> this._overrides.get(widgetLabel) || super.get(widgetLabel);
	}

	has<K extends keyof T>(widgetLabel: K): boolean {
		return this._overrides.has(widgetLabel) || super.has(widgetLabel);
	}
}

export const gridRegistry = new GridRegistry();
