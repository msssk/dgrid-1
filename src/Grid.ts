import { Subscription } from '@dojo/shim/Observable';
import { v, w } from '@dojo/widget-core/d';
import { DNode, PropertyChangeRecord } from '@dojo/widget-core/interfaces';
import { RegistryMixin }  from '@dojo/widget-core/mixins/Registry';
import { theme, ThemeableMixin, ThemeableProperties } from '@dojo/widget-core/mixins/Themeable';
import WidgetBase, { diffProperty } from '@dojo/widget-core/WidgetBase';
import DataProviderBase from './bases/DataProviderBase';
import Body from './Body';
import GridRegistry, { gridRegistry } from './GridRegistry';
import Header from './Header';
import { DataProperties, HasColumns, SortRequestListener } from './interfaces';
import Scrollbar from './Scrollbar';

import * as css from './styles/grid.m.css';
import * as sharedCellCss from './styles/shared/cell.m.css';

export const GridBase = ThemeableMixin(RegistryMixin(WidgetBase));

/**
 * @type GridProperties
 *
 * Properties that can be set on a Grid
 *
 * @property columns		Column definitions
 * @property dataProvider	An observable object that responds to events and returns {@link DataProperties}
 */
export interface GridProperties extends ThemeableProperties, HasColumns {
	registry?: GridRegistry;
	dataProvider: DataProviderBase;
}

@theme(sharedCellCss)
@theme(css)
class Grid extends GridBase<GridProperties> {
	private _data: DataProperties<object> = <DataProperties<object>> {};
	private _subscription: Subscription;
	private _sortRequestListener: SortRequestListener;

	protected _isBodyScrollHandlerDisabled: boolean;
	protected _isScrollbarScrollHandlerDisabled: boolean;
	protected _lastScrollerScrollTop: number;
	protected _minScrollIncrement: number;
	protected _scrollbarNode: HTMLElement;
	protected _scrollerNode: HTMLElement;
	protected _scrollScaleFactor: number;

	constructor() {
		super();

		this.registries.add(gridRegistry);
	}

	@diffProperty('dataProvider')
	protected diffPropertyDataProvider(previousDataProvider: DataProviderBase, dataProvider: DataProviderBase): PropertyChangeRecord {
		const changed = (previousDataProvider !== dataProvider);
		if (changed) {
			this._sortRequestListener = dataProvider.sort.bind(dataProvider);

			this._subscription && this._subscription.unsubscribe();
			this._subscription = dataProvider.observe().subscribe((data) => {
				this._data = (data || {});
				this.invalidate();
			});
			// TODO: Remove notify when on demand scrolling (https://github.com/dojo/dgrid/issues/21 Initialization) is added
			dataProvider.notify();
		}

		return {
			changed,
			value: dataProvider
		};
	}

	_disableBodyScrollHandler (timeout = 70) {
		this._isBodyScrollHandlerDisabled = true;
		setTimeout(this._enableBodyScrollHandler.bind(this), timeout);
	}

	_disableScrollbarScrollHandler (timeout = 70) {
		this._isScrollbarScrollHandlerDisabled = true;
		setTimeout(this._enableScrollbarScrollHandler.bind(this), timeout);
	}

	_enableBodyScrollHandler () {
		this._isBodyScrollHandlerDisabled = false;
	}

	_enableScrollbarScrollHandler () {
		this._isScrollbarScrollHandlerDisabled = false;
	}

	_handleBodyScroll (event: Event) {
		const newScrollTop = this._scrollerNode.scrollTop;

		if (Math.abs(newScrollTop - this._lastScrollerScrollTop) < this._minScrollIncrement) {
			return;
		}

		this._disableScrollbarScrollHandler();

		// TODO: this kills scroll performance in Firefox and Edge
		this._scrollbarNode.scrollTop = Math.round(newScrollTop / this._scrollScaleFactor);

		this._lastScrollerScrollTop = newScrollTop;
		console.log(newScrollTop, Math.round(newScrollTop / this._scrollScaleFactor));
	}

	_handleScrollbarScroll () {
		this._disableBodyScrollHandler();
		this._scrollerNode.scrollTop = Math.round(this._scrollbarNode.scrollTop * this._scrollScaleFactor);
	}

	protected _updateScrollDimensions (gridNode: HTMLElement) {
		const headerNode = <HTMLElement> gridNode.firstElementChild;
		const scrollHeaderNode = <HTMLElement> headerNode.nextElementSibling;
		const scrollbarNode = <HTMLElement> scrollHeaderNode.nextElementSibling;
		const scrollHeightNode = <HTMLElement> scrollbarNode.firstElementChild;
		const scrollerNode = <HTMLElement> scrollbarNode.nextElementSibling;
		const contentNode = <HTMLElement> scrollerNode.firstElementChild;

		this._scrollbarNode = scrollbarNode;
		this._scrollerNode = scrollerNode;

		let scrollbarWidth = scrollerNode.offsetWidth - scrollerNode.clientWidth;

		// Handle Safari which hides the scrollbar by default, giving a width of 0
		// Inspection has shown the visible scrollbar width to be 7px
		if (scrollbarWidth === 0) {
			scrollbarWidth = 7;
		}

		// Add 1 pixel: some browsers (IE, FF) don't make the scrollbar active if it doesn't have visible content
		scrollbarWidth += 1;
		const heightString = headerNode.offsetHeight + 'px';
		const widthString = scrollbarWidth + 'px';

		headerNode.style.paddingRight = (scrollbarWidth - 1) + 'px';
		scrollHeaderNode.style.height = heightString;
		scrollHeaderNode.style.width = widthString;
		scrollHeightNode.style.height = Math.min(10000, contentNode.offsetHeight) + 'px';
		scrollbarNode.style.top = heightString;
		scrollbarNode.style.height = (gridNode.offsetHeight - scrollHeaderNode.offsetHeight) + 'px';
		scrollbarNode.style.width = widthString;

		if (scrollbarNode.scrollHeight < scrollerNode.scrollHeight) {
			this._scrollScaleFactor = scrollerNode.scrollHeight / scrollbarNode.scrollHeight;
		}
		else {
			this._scrollScaleFactor = 1;
		}

		this._minScrollIncrement = scrollbarNode.scrollHeight / 100;
	}

	protected onElementUpdated(element: HTMLElement, key: string): void {
		console.log('why does this never get invoked');
	}

	protected onElementCreated(element: HTMLElement, key: string): void {
		console.log('why does this never get invoked');
	}

	render(): DNode {
		const {
			_data: {
				items = [],
				sort: sortDetails = []
			},
			_sortRequestListener: onSortRequest,
			properties: {
				columns,
				theme,
				registry = gridRegistry
			}
		} = this;

		return v('div', {
			afterCreate: this._updateScrollDimensions.bind(this),
			classes: this.classes(css.grid),
			role: 'grid'
		}, [
			w<Header>('header', {
				columns,
				registry,
				sortDetails,
				theme,
				onSortRequest
			}),
			v('div', {
				classes: this.classes(sharedCellCss.cell, css.scrollheader)
			}),
			w<Scrollbar>('scrollbar', {
				handleScroll: this._handleScrollbarScroll.bind(this)
			}),
			w<Body>('body', {
				columns,
				handleScroll: this._handleBodyScroll.bind(this),
				items,
				registry,
				theme
			})
		]);
	}
}

export default Grid;
