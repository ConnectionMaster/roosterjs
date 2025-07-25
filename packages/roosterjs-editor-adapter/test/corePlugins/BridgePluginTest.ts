import * as BridgePlugin from '../../lib/corePlugins/BridgePlugin';
import * as DarkColorHandler from '../../lib/editor/DarkColorHandlerImpl';
import * as EditPlugin from '../../lib/corePlugins/EditPlugin';
import * as eventConverter from '../../lib/editor/utils/eventConverter';
import { PluginEventType } from 'roosterjs-editor-types';

describe('BridgePlugin', () => {
    function createMockedPlugin(name: string) {
        return {
            initialize: () => {},
            dispose: () => {},
            getState: () => name,
        } as any;
    }
    beforeEach(() => {
        spyOn(EditPlugin, 'createEditPlugin').and.returnValue(createMockedPlugin('edit'));
    });

    it('Ctor and init', () => {
        const initializeSpy1 = jasmine.createSpy('initialize1');
        const initializeSpy2 = jasmine.createSpy('initialize2');
        const initializeSpy3 = jasmine.createSpy('initialize3');
        const onPluginEventSpy1 = jasmine.createSpy('onPluginEvent1');
        const onPluginEventSpy2 = jasmine.createSpy('onPluginEvent2');
        const onPluginEventSpy3 = jasmine.createSpy('onPluginEvent3');
        const disposeSpy = jasmine.createSpy('dispose');
        const queryElementsSpy = jasmine.createSpy('queryElement').and.returnValue([]);

        const mockedPlugin1 = {
            initialize: initializeSpy1,
            onPluginEvent: onPluginEventSpy1,
            dispose: disposeSpy,
            getName: () => '',
        } as any;
        const mockedPlugin2 = {
            initialize: initializeSpy2,
            onPluginEvent: onPluginEventSpy2,
            dispose: disposeSpy,
            getName: () => '',
        } as any;
        const mockedPlugin3 = {
            initialize: initializeSpy3,
            onPluginEvent: onPluginEventSpy3,
            dispose: disposeSpy,
            getName: () => 'TableCellSelection',
        } as any;
        const mockedEditor = {
            queryElements: queryElementsSpy,
        } as any;
        const onInitializeSpy = jasmine.createSpy('onInitialize').and.returnValue(mockedEditor);
        const plugin = new BridgePlugin.BridgePlugin(onInitializeSpy, [
            mockedPlugin1,
            mockedPlugin2,
            mockedPlugin3,
        ]);
        expect(initializeSpy1).not.toHaveBeenCalled();
        expect(initializeSpy2).not.toHaveBeenCalled();
        expect(initializeSpy3).not.toHaveBeenCalled();
        expect(onPluginEventSpy1).not.toHaveBeenCalled();
        expect(onPluginEventSpy2).not.toHaveBeenCalled();
        expect(disposeSpy).not.toHaveBeenCalled();
        expect(onInitializeSpy).not.toHaveBeenCalled();

        const mockedZoomScale = 'ZOOM' as any;
        const calculateZoomScaleSpy = jasmine
            .createSpy('calculateZoomScale')
            .and.returnValue(mockedZoomScale);
        const mockedColorManager = 'COLOR' as any;
        const mockedInnerDarkColorHandler = 'INNERCOLOR' as any;
        const mockedInnerEditor = {
            getDOMHelper: () => ({
                calculateZoomScale: calculateZoomScaleSpy,
            }),
            getColorManager: () => mockedInnerDarkColorHandler,
            getEnvironment: () => {
                return {
                    domToModelSettings: {
                        customized: {},
                    },
                };
            },
        } as any;

        const createDarkColorHandlerSpy = spyOn(
            DarkColorHandler,
            'createDarkColorHandler'
        ).and.returnValue(mockedColorManager);

        plugin.initialize(mockedInnerEditor);

        expect(onInitializeSpy).toHaveBeenCalledWith({
            customData: {},
            experimentalFeatures: [],
            sizeTransformer: jasmine.anything(),
            darkColorHandler: mockedColorManager,
            edit: 'edit',
            contextMenuProviders: [],
        } as any);
        expect(createDarkColorHandlerSpy).toHaveBeenCalledWith(mockedInnerDarkColorHandler);
        expect(initializeSpy1).toHaveBeenCalledTimes(1);
        expect(initializeSpy2).toHaveBeenCalledTimes(1);
        expect(initializeSpy3).toHaveBeenCalledTimes(0);
        expect(disposeSpy).not.toHaveBeenCalled();
        expect(initializeSpy1).toHaveBeenCalledWith(mockedEditor);
        expect(initializeSpy2).toHaveBeenCalledWith(mockedEditor);
        expect(onPluginEventSpy1).not.toHaveBeenCalled();
        expect(onPluginEventSpy2).not.toHaveBeenCalled();

        plugin.onPluginEvent({
            eventType: 'editorReady',
            addedBlockElements: [],
            removedBlockElements: [],
        });

        expect(onPluginEventSpy1).toHaveBeenCalledTimes(1);
        expect(onPluginEventSpy2).toHaveBeenCalledTimes(1);
        expect(onPluginEventSpy1).toHaveBeenCalledWith({
            eventType: PluginEventType.EditorReady,
            eventDataCache: undefined,
        });
        expect(onPluginEventSpy2).toHaveBeenCalledWith({
            eventType: PluginEventType.EditorReady,
            eventDataCache: undefined,
        });

        plugin.dispose();

        expect(disposeSpy).toHaveBeenCalledTimes(2);
    });

    it('Ctor and init with more options', () => {
        const initializeSpy = jasmine.createSpy('initialize');
        const onPluginEventSpy1 = jasmine.createSpy('onPluginEvent1');
        const onPluginEventSpy2 = jasmine.createSpy('onPluginEvent2');
        const disposeSpy = jasmine.createSpy('dispose');
        const queryElementsSpy = jasmine.createSpy('queryElement').and.returnValue([]);

        const mockedPlugin1 = {
            initialize: initializeSpy,
            onPluginEvent: onPluginEventSpy1,
            dispose: disposeSpy,
            getName: () => '',
        } as any;
        const mockedPlugin2 = {
            initialize: initializeSpy,
            onPluginEvent: onPluginEventSpy2,
            dispose: disposeSpy,
            getName: () => '',
        } as any;
        const mockedEditor = {
            queryElements: queryElementsSpy,
        } as any;
        const onInitializeSpy = jasmine.createSpy('onInitialize').and.returnValue(mockedEditor);
        const plugin = new BridgePlugin.BridgePlugin(
            onInitializeSpy,
            [mockedPlugin1, mockedPlugin2],
            ['c' as any]
        );
        expect(initializeSpy).not.toHaveBeenCalled();
        expect(onPluginEventSpy1).not.toHaveBeenCalled();
        expect(onPluginEventSpy2).not.toHaveBeenCalled();
        expect(disposeSpy).not.toHaveBeenCalled();
        expect(onInitializeSpy).not.toHaveBeenCalled();

        const mockedZoomScale = 'ZOOM' as any;
        const calculateZoomScaleSpy = jasmine
            .createSpy('calculateZoomScale')
            .and.returnValue(mockedZoomScale);
        const mockedColorManager = 'COLOR' as any;
        const mockedInnerDarkColorHandler = 'INNERCOLOR' as any;
        const mockedInnerEditor = {
            getDOMHelper: () => ({
                calculateZoomScale: calculateZoomScaleSpy,
            }),
            getColorManager: () => mockedInnerDarkColorHandler,
            getEnvironment: () => {
                return {
                    domToModelSettings: {
                        customized: {},
                    },
                };
            },
        } as any;

        const createDarkColorHandlerSpy = spyOn(
            DarkColorHandler,
            'createDarkColorHandler'
        ).and.returnValue(mockedColorManager);

        plugin.initialize(mockedInnerEditor);

        expect(onInitializeSpy).toHaveBeenCalledWith({
            customData: {},
            experimentalFeatures: ['c'],
            sizeTransformer: jasmine.anything(),
            darkColorHandler: mockedColorManager,
            edit: 'edit',
            contextMenuProviders: [],
        } as any);
        expect(createDarkColorHandlerSpy).toHaveBeenCalledWith(mockedInnerDarkColorHandler);
        expect(initializeSpy).toHaveBeenCalledTimes(2);
        expect(disposeSpy).not.toHaveBeenCalled();
        expect(initializeSpy).toHaveBeenCalledWith(mockedEditor);
        expect(onPluginEventSpy1).not.toHaveBeenCalled();
        expect(onPluginEventSpy2).not.toHaveBeenCalled();

        plugin.onPluginEvent({
            eventType: 'editorReady',
            addedBlockElements: [],
            removedBlockElements: [],
        });

        expect(onPluginEventSpy1).toHaveBeenCalledTimes(1);
        expect(onPluginEventSpy2).toHaveBeenCalledTimes(1);
        expect(onPluginEventSpy1).toHaveBeenCalledWith({
            eventType: PluginEventType.EditorReady,
            eventDataCache: undefined,
        });
        expect(onPluginEventSpy2).toHaveBeenCalledWith({
            eventType: PluginEventType.EditorReady,
            eventDataCache: undefined,
        });

        plugin.dispose();

        expect(disposeSpy).toHaveBeenCalledTimes(2);
    });

    it('willHandleEventExclusively', () => {
        const initializeSpy = jasmine.createSpy('initialize');
        const onPluginEventSpy1 = jasmine.createSpy('onPluginEvent1');
        const onPluginEventSpy2 = jasmine.createSpy('onPluginEvent2');
        const disposeSpy = jasmine.createSpy('dispose');
        const willHandleEventExclusivelySpy = jasmine
            .createSpy('willHandleEventExclusively')
            .and.returnValue(true);

        const mockedPlugin1 = {
            initialize: initializeSpy,
            onPluginEvent: onPluginEventSpy1,
            dispose: disposeSpy,
            getName: () => '',
        } as any;
        const mockedPlugin2 = {
            initialize: initializeSpy,
            onPluginEvent: onPluginEventSpy2,
            willHandleEventExclusively: willHandleEventExclusivelySpy,
            dispose: disposeSpy,
            getName: () => '',
        } as any;
        const mockedEditor = 'EDITOR' as any;
        const onInitializeSpy = jasmine.createSpy('onInitialize').and.returnValue(mockedEditor);
        const plugin = new BridgePlugin.BridgePlugin(onInitializeSpy, [
            mockedPlugin1,
            mockedPlugin2,
        ]);

        spyOn(eventConverter, 'newEventToOldEvent').and.callFake(newEvent => {
            return ('NEW_' + newEvent) as any;
        });

        const mockedEvent = {} as any;
        const result = plugin.willHandleEventExclusively(mockedEvent);

        expect(result).toBeTrue();
        expect(mockedEvent).toEqual({
            eventDataCache: {
                __ExclusivelyHandleEventPlugin: mockedPlugin2,
                __OldEventFromNewEvent: 'NEW_[object Object]',
            },
        });
        expect(eventConverter.newEventToOldEvent).toHaveBeenCalledTimes(1);
        expect(eventConverter.newEventToOldEvent).toHaveBeenCalledWith(mockedEvent);

        plugin.dispose();
    });

    it('onPluginEvent without exclusive handling', () => {
        const initializeSpy = jasmine.createSpy('initialize');
        const onPluginEventSpy1 = jasmine.createSpy('onPluginEvent1').and.callFake(event => {
            event.data = 'plugin1';
        });
        const onPluginEventSpy2 = jasmine.createSpy('onPluginEvent2').and.callFake(event => {
            event.data = 'plugin2';
        });
        const disposeSpy = jasmine.createSpy('dispose');

        const mockedPlugin1 = {
            initialize: initializeSpy,
            onPluginEvent: onPluginEventSpy1,
            dispose: disposeSpy,
            getName: () => '',
        } as any;
        const mockedPlugin2 = {
            initialize: initializeSpy,
            onPluginEvent: onPluginEventSpy2,
            dispose: disposeSpy,
            getName: () => '',
        } as any;

        const mockedEditor = 'EDITOR' as any;
        const onInitializeSpy = jasmine.createSpy('onInitialize').and.returnValue(mockedEditor);
        const plugin = new BridgePlugin.BridgePlugin(onInitializeSpy, [
            mockedPlugin1,
            mockedPlugin2,
        ]);

        spyOn(eventConverter, 'newEventToOldEvent').and.callFake(newEvent => {
            return {
                eventType: 'old_' + newEvent.eventType,
            } as any;
        });
        spyOn(eventConverter, 'oldEventToNewEvent').and.callFake((oldEvent: any) => {
            return {
                eventType: 'new_' + oldEvent.eventType,
                data: oldEvent.data,
            } as any;
        });

        const mockedEvent = {
            eventType: 'newEvent',
        } as any;

        plugin.onPluginEvent(mockedEvent);

        expect(onPluginEventSpy1).toHaveBeenCalledTimes(1);
        expect(onPluginEventSpy1).toHaveBeenCalledWith({
            eventType: 'old_newEvent',
            data: 'plugin2',
        });
        expect(onPluginEventSpy2).toHaveBeenCalledTimes(1);
        expect(onPluginEventSpy2).toHaveBeenCalledWith({
            eventType: 'old_newEvent',
            data: 'plugin2',
        });
        expect(eventConverter.newEventToOldEvent).toHaveBeenCalledTimes(1);
        expect(eventConverter.newEventToOldEvent).toHaveBeenCalledWith(mockedEvent);
        expect(eventConverter.oldEventToNewEvent).toHaveBeenCalledTimes(1);
        expect(eventConverter.oldEventToNewEvent).toHaveBeenCalledWith(
            {
                eventType: 'old_newEvent' as any,
                data: 'plugin2',
            },
            {
                eventType: 'new_old_newEvent' as any,
                data: 'plugin2',
                eventDataCache: {
                    __ExclusivelyHandleEventPlugin: null,
                    __OldEventFromNewEvent: { eventType: 'old_newEvent', data: 'plugin2' },
                },
            },
            undefined
        );

        expect(mockedEvent).toEqual({
            eventType: 'new_old_newEvent',
            data: 'plugin2',
            eventDataCache: {
                __ExclusivelyHandleEventPlugin: null,
                __OldEventFromNewEvent: { eventType: 'old_newEvent', data: 'plugin2' },
            },
        });

        plugin.dispose();
    });

    it('onPluginEvent with exclusive handling', () => {
        const initializeSpy = jasmine.createSpy('initialize');
        const onPluginEventSpy1 = jasmine.createSpy('onPluginEvent1');
        const onPluginEventSpy2 = jasmine.createSpy('onPluginEvent2');
        const disposeSpy = jasmine.createSpy('dispose');

        const mockedPlugin1 = {
            initialize: initializeSpy,
            onPluginEvent: onPluginEventSpy1,
            dispose: disposeSpy,
            getName: () => '',
        } as any;
        const mockedPlugin2 = {
            initialize: initializeSpy,
            onPluginEvent: onPluginEventSpy2,
            dispose: disposeSpy,
            getName: () => '',
        } as any;

        const mockedEditor = 'EDITOR' as any;
        const onInitializeSpy = jasmine.createSpy('onInitialize').and.returnValue(mockedEditor);
        const plugin = new BridgePlugin.BridgePlugin(onInitializeSpy, [
            mockedPlugin1,
            mockedPlugin2,
        ]);

        spyOn(eventConverter, 'newEventToOldEvent').and.callFake(newEvent => {
            return {
                eventType: 'old_' + newEvent.eventType,
                eventDataCache: newEvent.eventDataCache,
            } as any;
        });

        const mockedEvent = {
            eventType: 'newEvent',
            eventDataCache: {
                __ExclusivelyHandleEventPlugin: mockedPlugin2,
            },
        } as any;

        plugin.onPluginEvent(mockedEvent);

        expect(onPluginEventSpy1).toHaveBeenCalledTimes(0);
        expect(onPluginEventSpy2).toHaveBeenCalledTimes(1);
        expect(onPluginEventSpy2).toHaveBeenCalledWith({
            eventType: 'old_newEvent',
            eventDataCache: {
                __ExclusivelyHandleEventPlugin: mockedPlugin2,
                __OldEventFromNewEvent: jasmine.anything(),
            },
        });
        expect(eventConverter.newEventToOldEvent).toHaveBeenCalledTimes(1);
        expect(eventConverter.newEventToOldEvent).toHaveBeenCalledWith(mockedEvent);

        plugin.dispose();
    });

    it('Context Menu provider', () => {
        const initializeSpy = jasmine.createSpy('initialize');
        const onPluginEventSpy1 = jasmine.createSpy('onPluginEvent1');
        const onPluginEventSpy2 = jasmine.createSpy('onPluginEvent2');
        const disposeSpy = jasmine.createSpy('dispose');
        const queryElementsSpy = jasmine.createSpy('queryElement').and.returnValue([]);
        const getContextMenuItemsSpy1 = jasmine
            .createSpy('getContextMenuItems 1')
            .and.returnValue(['item1', 'item2']);
        const getContextMenuItemsSpy2 = jasmine
            .createSpy('getContextMenuItems 2')
            .and.returnValue(['item3', 'item4']);

        const mockedPlugin1 = {
            initialize: initializeSpy,
            onPluginEvent: onPluginEventSpy1,
            dispose: disposeSpy,
            getContextMenuItems: getContextMenuItemsSpy1,
            getName: () => '',
        } as any;
        const mockedPlugin2 = {
            initialize: initializeSpy,
            onPluginEvent: onPluginEventSpy2,
            dispose: disposeSpy,
            getContextMenuItems: getContextMenuItemsSpy2,
            getName: () => '',
        } as any;
        const mockedEditor = {
            queryElements: queryElementsSpy,
        } as any;

        const onInitializeSpy = jasmine.createSpy('onInitialize').and.returnValue(mockedEditor);
        const plugin = new BridgePlugin.BridgePlugin(onInitializeSpy, [
            mockedPlugin1,
            mockedPlugin2,
        ]);
        expect(initializeSpy).not.toHaveBeenCalled();
        expect(onPluginEventSpy1).not.toHaveBeenCalled();
        expect(onPluginEventSpy2).not.toHaveBeenCalled();
        expect(disposeSpy).not.toHaveBeenCalled();

        const mockedZoomScale = 'ZOOM' as any;
        const calculateZoomScaleSpy = jasmine
            .createSpy('calculateZoomScale')
            .and.returnValue(mockedZoomScale);
        const mockedColorManager = 'COLOR' as any;
        const mockedInnerEditor = {
            getDOMHelper: () => ({
                calculateZoomScale: calculateZoomScaleSpy,
            }),
            getColorManager: () => mockedColorManager,
            getEnvironment: () => {
                return {
                    domToModelSettings: {
                        customized: {},
                    },
                };
            },
        } as any;
        const mockedDarkColorHandler = 'COLOR' as any;
        const createDarkColorHandlerSpy = spyOn(
            DarkColorHandler,
            'createDarkColorHandler'
        ).and.returnValue(mockedDarkColorHandler);

        plugin.initialize(mockedInnerEditor);

        expect(onInitializeSpy).toHaveBeenCalledWith({
            customData: {},
            experimentalFeatures: [],
            sizeTransformer: jasmine.anything(),
            darkColorHandler: mockedDarkColorHandler,
            edit: 'edit',
            contextMenuProviders: [mockedPlugin1, mockedPlugin2],
        } as any);
        expect(createDarkColorHandlerSpy).toHaveBeenCalledWith(mockedColorManager);
        expect(initializeSpy).toHaveBeenCalledTimes(2);
        expect(onPluginEventSpy1).toHaveBeenCalledTimes(0);
        expect(onPluginEventSpy2).toHaveBeenCalledTimes(0);
        expect(disposeSpy).not.toHaveBeenCalled();
        expect(initializeSpy).toHaveBeenCalledWith(mockedEditor);

        plugin.onPluginEvent({
            eventType: 'editorReady',
            addedBlockElements: [],
            removedBlockElements: [],
        });

        expect(onPluginEventSpy1).toHaveBeenCalledTimes(1);
        expect(onPluginEventSpy2).toHaveBeenCalledTimes(1);
        expect(disposeSpy).not.toHaveBeenCalled();
        expect(onPluginEventSpy1).toHaveBeenCalledWith({
            eventType: PluginEventType.EditorReady,
            eventDataCache: undefined,
        });
        expect(onPluginEventSpy2).toHaveBeenCalledWith({
            eventType: PluginEventType.EditorReady,
            eventDataCache: undefined,
        });

        const mockedNode = 'NODE' as any;

        const items = plugin.getContextMenuItems(mockedNode);

        expect(items).toEqual(['item1', 'item2', null, 'item3', 'item4']);
        expect(getContextMenuItemsSpy1).toHaveBeenCalledWith(mockedNode);
        expect(getContextMenuItemsSpy2).toHaveBeenCalledWith(mockedNode);

        plugin.dispose();

        expect(disposeSpy).toHaveBeenCalledTimes(2);
    });

    it('MixedPlugin', () => {
        const initializeV8Spy = jasmine.createSpy('initializeV8');
        const initializeV9Spy = jasmine.createSpy('initializeV9');
        const onPluginEventV8Spy = jasmine.createSpy('onPluginEventV8');
        const onPluginEventV9Spy = jasmine.createSpy('onPluginEventV9');
        const willHandleEventExclusivelyV8Spy = jasmine.createSpy('willHandleEventExclusivelyV8');
        const willHandleEventExclusivelyV9Spy = jasmine.createSpy('willHandleEventExclusivelyV9');
        const disposeSpy = jasmine.createSpy('dispose');

        const mockedPlugin = {
            initialize: initializeV8Spy,
            initializeV9: initializeV9Spy,
            onPluginEvent: onPluginEventV8Spy,
            onPluginEventV9: onPluginEventV9Spy,
            willHandleEventExclusively: willHandleEventExclusivelyV8Spy,
            willHandleEventExclusivelyV9: willHandleEventExclusivelyV9Spy,
            dispose: disposeSpy,
            getName: () => '',
        } as any;
        const mockedEditor = {} as any;
        const onInitializeSpy = jasmine.createSpy('onInitialize').and.returnValue(mockedEditor);
        const plugin = new BridgePlugin.BridgePlugin(onInitializeSpy, [mockedPlugin]);

        expect(initializeV8Spy).not.toHaveBeenCalled();
        expect(initializeV9Spy).not.toHaveBeenCalled();
        expect(onPluginEventV8Spy).not.toHaveBeenCalled();
        expect(onPluginEventV9Spy).not.toHaveBeenCalled();
        expect(disposeSpy).not.toHaveBeenCalled();
        expect(onInitializeSpy).not.toHaveBeenCalled();
        expect(willHandleEventExclusivelyV8Spy).not.toHaveBeenCalled();
        expect(willHandleEventExclusivelyV9Spy).not.toHaveBeenCalled();

        const mockedZoomScale = 'ZOOM' as any;
        const calculateZoomScaleSpy = jasmine
            .createSpy('calculateZoomScale')
            .and.returnValue(mockedZoomScale);
        const mockedColorManager = 'COLOR' as any;
        const mockedInnerDarkColorHandler = 'INNERCOLOR' as any;

        const mockedInnerEditor = {
            getDOMHelper: () => ({
                calculateZoomScale: calculateZoomScaleSpy,
            }),
            getColorManager: () => mockedInnerDarkColorHandler,
            getEnvironment: () => {
                return {
                    domToModelSettings: {
                        customized: {},
                    },
                };
            },
        } as any;

        const createDarkColorHandlerSpy = spyOn(
            DarkColorHandler,
            'createDarkColorHandler'
        ).and.returnValue(mockedColorManager);

        plugin.initialize(mockedInnerEditor);

        expect(onInitializeSpy).toHaveBeenCalledWith({
            customData: {},
            experimentalFeatures: [],
            sizeTransformer: jasmine.anything(),
            darkColorHandler: mockedColorManager,
            edit: 'edit',
            contextMenuProviders: [],
        } as any);
        expect(createDarkColorHandlerSpy).toHaveBeenCalledWith(mockedInnerDarkColorHandler);
        expect(initializeV8Spy).toHaveBeenCalledTimes(1);
        expect(initializeV9Spy).toHaveBeenCalledTimes(1);
        expect(disposeSpy).not.toHaveBeenCalled();
        expect(initializeV8Spy).toHaveBeenCalledWith(mockedEditor);
        expect(initializeV9Spy).toHaveBeenCalledWith(mockedInnerEditor);
        expect(onPluginEventV8Spy).not.toHaveBeenCalled();
        expect(onPluginEventV9Spy).not.toHaveBeenCalled();
        expect(willHandleEventExclusivelyV8Spy).not.toHaveBeenCalled();
        expect(willHandleEventExclusivelyV9Spy).not.toHaveBeenCalled();

        plugin.onPluginEvent({
            eventType: 'editorReady',
            addedBlockElements: [],
            removedBlockElements: [],
        });

        expect(onPluginEventV8Spy).toHaveBeenCalledTimes(1);
        expect(onPluginEventV9Spy).toHaveBeenCalledTimes(1);
        expect(onPluginEventV8Spy).toHaveBeenCalledWith({
            eventType: PluginEventType.EditorReady,
            eventDataCache: undefined,
        });
        expect(onPluginEventV9Spy).toHaveBeenCalledWith({
            eventType: 'editorReady',
            addedBlockElements: [],
            removedBlockElements: [],
            eventDataCache: undefined,
        });
        expect(willHandleEventExclusivelyV8Spy).toHaveBeenCalledTimes(1);
        expect(willHandleEventExclusivelyV9Spy).toHaveBeenCalledTimes(1);

        plugin.dispose();

        expect(disposeSpy).toHaveBeenCalledTimes(1);
    });

    it('MixedPlugin with event that is not supported in v8', () => {
        const initializeV8Spy = jasmine.createSpy('initializeV8');
        const initializeV9Spy = jasmine.createSpy('initializeV9');
        const onPluginEventV8Spy = jasmine.createSpy('onPluginEventV8');
        const onPluginEventV9Spy = jasmine.createSpy('onPluginEventV9');
        const willHandleEventExclusivelyV8Spy = jasmine.createSpy('willHandleEventExclusivelyV8');
        const willHandleEventExclusivelyV9Spy = jasmine.createSpy('willHandleEventExclusivelyV9');
        const disposeSpy = jasmine.createSpy('dispose');

        const mockedPlugin = {
            initialize: initializeV8Spy,
            initializeV9: initializeV9Spy,
            onPluginEvent: onPluginEventV8Spy,
            onPluginEventV9: onPluginEventV9Spy,
            willHandleEventExclusively: willHandleEventExclusivelyV8Spy,
            willHandleEventExclusivelyV9: willHandleEventExclusivelyV9Spy,
            dispose: disposeSpy,
            getName: () => '',
        } as any;
        const mockedEditor = {} as any;
        const onInitializeSpy = jasmine.createSpy('onInitialize').and.returnValue(mockedEditor);
        const plugin = new BridgePlugin.BridgePlugin(onInitializeSpy, [mockedPlugin]);

        expect(initializeV8Spy).not.toHaveBeenCalled();
        expect(initializeV9Spy).not.toHaveBeenCalled();
        expect(onPluginEventV8Spy).not.toHaveBeenCalled();
        expect(onPluginEventV9Spy).not.toHaveBeenCalled();
        expect(disposeSpy).not.toHaveBeenCalled();
        expect(onInitializeSpy).not.toHaveBeenCalled();
        expect(willHandleEventExclusivelyV8Spy).not.toHaveBeenCalled();
        expect(willHandleEventExclusivelyV9Spy).not.toHaveBeenCalled();

        const mockedZoomScale = 'ZOOM' as any;
        const calculateZoomScaleSpy = jasmine
            .createSpy('calculateZoomScale')
            .and.returnValue(mockedZoomScale);
        const mockedColorManager = 'COLOR' as any;
        const mockedInnerDarkColorHandler = 'INNERCOLOR' as any;
        const mockedInnerEditor = {
            getDOMHelper: () => ({
                calculateZoomScale: calculateZoomScaleSpy,
            }),
            getColorManager: () => mockedInnerDarkColorHandler,
            getEnvironment: () => {
                return {
                    domToModelSettings: {
                        customized: {},
                    },
                };
            },
        } as any;

        const createDarkColorHandlerSpy = spyOn(
            DarkColorHandler,
            'createDarkColorHandler'
        ).and.returnValue(mockedColorManager);

        plugin.initialize(mockedInnerEditor);

        expect(onInitializeSpy).toHaveBeenCalledWith({
            customData: {},
            experimentalFeatures: [],
            sizeTransformer: jasmine.anything(),
            darkColorHandler: mockedColorManager,
            edit: 'edit',
            contextMenuProviders: [],
        } as any);
        expect(createDarkColorHandlerSpy).toHaveBeenCalledWith(mockedInnerDarkColorHandler);
        expect(initializeV8Spy).toHaveBeenCalledTimes(1);
        expect(initializeV9Spy).toHaveBeenCalledTimes(1);
        expect(disposeSpy).not.toHaveBeenCalled();
        expect(initializeV8Spy).toHaveBeenCalledWith(mockedEditor);
        expect(initializeV9Spy).toHaveBeenCalledWith(mockedInnerEditor);
        expect(onPluginEventV8Spy).not.toHaveBeenCalled();
        expect(onPluginEventV9Spy).not.toHaveBeenCalled();
        expect(willHandleEventExclusivelyV8Spy).not.toHaveBeenCalled();
        expect(willHandleEventExclusivelyV9Spy).not.toHaveBeenCalled();

        plugin.onPluginEvent({
            eventType: 'rewriteFromModel',
            addedBlockElements: [],
            removedBlockElements: [],
        });

        expect(onPluginEventV8Spy).toHaveBeenCalledTimes(0);
        expect(onPluginEventV9Spy).toHaveBeenCalledTimes(1);
        expect(onPluginEventV9Spy).toHaveBeenCalledWith({
            eventType: 'rewriteFromModel',
            addedBlockElements: [],
            removedBlockElements: [],
            eventDataCache: {
                __OldEventFromNewEvent: undefined,
                __ExclusivelyHandleEventPlugin: null,
            },
        });
        expect(willHandleEventExclusivelyV8Spy).toHaveBeenCalledTimes(0);
        expect(willHandleEventExclusivelyV9Spy).toHaveBeenCalledTimes(1);

        plugin.dispose();

        expect(disposeSpy).toHaveBeenCalledTimes(1);
    });
});
