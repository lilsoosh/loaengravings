
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function set_store_value(store, ret, value) {
        store.set(value);
        return ret;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function get_root_for_style(node) {
        if (!node)
            return document;
        const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
        if (root && root.host) {
            return root;
        }
        return node.ownerDocument;
    }
    function append_empty_stylesheet(node) {
        const style_element = element('style');
        append_stylesheet(get_root_for_style(node), style_element);
        return style_element.sheet;
    }
    function append_stylesheet(node, style) {
        append(node.head || node, style);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        if (value === null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }

    // we need to store the information for multiple documents because a Svelte application could also contain iframes
    // https://github.com/sveltejs/svelte/issues/3624
    const managed_styles = new Map();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_style_information(doc, node) {
        const info = { stylesheet: append_empty_stylesheet(node), rules: {} };
        managed_styles.set(doc, info);
        return info;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = get_root_for_style(node);
        const { stylesheet, rules } = managed_styles.get(doc) || create_style_information(doc, node);
        if (!rules[name]) {
            rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            managed_styles.forEach(info => {
                const { stylesheet } = info;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                info.rules = {};
            });
            managed_styles.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail, { cancelable = false } = {}) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail, { cancelable });
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
                return !event.defaultPrevented;
            }
            return true;
        };
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
        else if (callback) {
            callback();
        }
    }
    const null_transition = { duration: 0 };
    function create_in_transition(node, fn, params) {
        let config = fn(node, params);
        let running = false;
        let animation_name;
        let task;
        let uid = 0;
        function cleanup() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
            tick(0, 1);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            if (task)
                task.abort();
            running = true;
            add_render_callback(() => dispatch(node, true, 'start'));
            task = loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(1, 0);
                        dispatch(node, true, 'end');
                        cleanup();
                        return running = false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(t, 1 - t);
                    }
                }
                return running;
            });
        }
        let started = false;
        return {
            start() {
                if (started)
                    return;
                started = true;
                delete_rule(node);
                if (is_function(config)) {
                    config = config();
                    wait().then(go);
                }
                else {
                    go();
                }
            },
            invalidate() {
                started = false;
            },
            end() {
                if (running) {
                    cleanup();
                    running = false;
                }
            }
        };
    }
    function create_out_transition(node, fn, params) {
        let config = fn(node, params);
        let running = true;
        let animation_name;
        const group = outros;
        group.r += 1;
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 1, 0, duration, delay, easing, css);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            add_render_callback(() => dispatch(node, false, 'start'));
            loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(0, 1);
                        dispatch(node, false, 'end');
                        if (!--group.r) {
                            // this will result in `end()` being called,
                            // so we don't need to clean up here
                            run_all(group.c);
                        }
                        return false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(1 - t, t);
                    }
                }
                return running;
            });
        }
        if (is_function(config)) {
            wait().then(() => {
                // @ts-ignore
                config = config();
                go();
            });
        }
        else {
            go();
        }
        return {
            end(reset) {
                if (reset && config.tick) {
                    config.tick(1, 0);
                }
                if (running) {
                    if (animation_name)
                        delete_rule(node, animation_name);
                    running = false;
                }
            }
        };
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, 1, () => {
            lookup.delete(block.key);
        });
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(child_ctx, dirty);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error('Cannot have duplicate keys in a keyed each');
            }
            keys.add(key);
        }
    }

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.49.0' }, detail), { bubbles: true }));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src\components\header.svelte generated by Svelte v3.49.0 */
    const file$6 = "src\\components\\header.svelte";

    function get_each_context$5(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	return child_ctx;
    }

    // (16:12) {#each tabs as tab}
    function create_each_block$5(ctx) {
    	let li;
    	let div;
    	let t0_value = /*tab*/ ctx[4] + "";
    	let t0;
    	let t1;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[3](/*tab*/ ctx[4]);
    	}

    	const block = {
    		c: function create() {
    			li = element("li");
    			div = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			attr_dev(div, "class", "svelte-1levd9w");
    			toggle_class(div, "active", /*tab*/ ctx[4] === /*activeTab*/ ctx[1]);
    			add_location(div, file$6, 17, 16, 510);
    			attr_dev(li, "class", "svelte-1levd9w");
    			add_location(li, file$6, 16, 12, 445);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, div);
    			append_dev(div, t0);
    			append_dev(li, t1);

    			if (!mounted) {
    				dispose = listen_dev(li, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*tabs*/ 1 && t0_value !== (t0_value = /*tab*/ ctx[4] + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*tabs, activeTab*/ 3) {
    				toggle_class(div, "active", /*tab*/ ctx[4] === /*activeTab*/ ctx[1]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$5.name,
    		type: "each",
    		source: "(16:12) {#each tabs as tab}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let header;
    	let div1;
    	let div0;
    	let t0;
    	let img;
    	let img_src_value;
    	let t1;
    	let h1;
    	let t3;
    	let ul;
    	let each_value = /*tabs*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$5(get_each_context$5(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			header = element("header");
    			div1 = element("div");
    			div0 = element("div");
    			t0 = space();
    			img = element("img");
    			t1 = space();
    			h1 = element("h1");
    			h1.textContent = "SOOSH.site";
    			t3 = space();
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div0, "class", "headerBG svelte-1levd9w");
    			add_location(div0, file$6, 11, 8, 240);
    			if (!src_url_equal(img.src, img_src_value = "./images/lil_soosh.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "logo");
    			attr_dev(img, "class", "logo svelte-1levd9w");
    			add_location(img, file$6, 12, 8, 278);
    			attr_dev(h1, "class", "site-title svelte-1levd9w");
    			add_location(h1, file$6, 13, 8, 346);
    			attr_dev(ul, "class", "svelte-1levd9w");
    			add_location(ul, file$6, 14, 8, 394);
    			attr_dev(div1, "class", "header-container svelte-1levd9w");
    			add_location(div1, file$6, 10, 4, 200);
    			add_location(header, file$6, 9, 0, 186);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);
    			append_dev(header, div1);
    			append_dev(div1, div0);
    			append_dev(div1, t0);
    			append_dev(div1, img);
    			append_dev(div1, t1);
    			append_dev(div1, h1);
    			append_dev(div1, t3);
    			append_dev(div1, ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*dispatch, tabs, activeTab*/ 7) {
    				each_value = /*tabs*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$5(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$5(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Header', slots, []);
    	const dispatch = createEventDispatcher();
    	let { tabs } = $$props;
    	let { activeTab } = $$props;
    	const writable_props = ['tabs', 'activeTab'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Header> was created with unknown prop '${key}'`);
    	});

    	const click_handler = tab => dispatch('tabChange', tab);

    	$$self.$$set = $$props => {
    		if ('tabs' in $$props) $$invalidate(0, tabs = $$props.tabs);
    		if ('activeTab' in $$props) $$invalidate(1, activeTab = $$props.activeTab);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		dispatch,
    		tabs,
    		activeTab
    	});

    	$$self.$inject_state = $$props => {
    		if ('tabs' in $$props) $$invalidate(0, tabs = $$props.tabs);
    		if ('activeTab' in $$props) $$invalidate(1, activeTab = $$props.activeTab);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [tabs, activeTab, dispatch, click_handler];
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { tabs: 0, activeTab: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Header",
    			options,
    			id: create_fragment$6.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*tabs*/ ctx[0] === undefined && !('tabs' in props)) {
    			console.warn("<Header> was created without expected prop 'tabs'");
    		}

    		if (/*activeTab*/ ctx[1] === undefined && !('activeTab' in props)) {
    			console.warn("<Header> was created without expected prop 'activeTab'");
    		}
    	}

    	get tabs() {
    		throw new Error("<Header>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tabs(value) {
    		throw new Error("<Header>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get activeTab() {
    		throw new Error("<Header>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set activeTab(value) {
    		throw new Error("<Header>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    const SelectedClass = writable('');

    const SelectedEngravings = writable([]);
    ///{id:1337, engraving:'Igniter', nodes: ['-','+5','-','-','-','-','-']}

    const NegativeEngravings = writable([
            {id:-1, engraving:'Atk. Power Reduction', nodes:['-','-','-','-','-','-','-']},
            {id:-2, engraving:'Atk. Speed Reduction', nodes:['-','-','-','-','-','-','-']},
            {id:-3, engraving:'Defense Reduction', nodes:['-','-','-','-','-','-','-']},
            {id:-4, engraving:'Move Speed Reduction', nodes:['-','-','-','-','-','-','-']}
    ]);

    const SurClassStore = readable(['Warrior', 'Martial Artist', 'Gunner', 'Mage', 'Assassin']);

    const ClassStore = readable([
            ['Berserker', 'Paladin', 'Gunlancer', 'Destroyer'],
            ['Striker', 'Wardancer', 'Scrapper', 'Soulfist', 'Glaivier'],
            ['Gunslinger', 'Artillerist', 'Deadeye', 'Sharpshooter'],
            ['Bard', 'Sorceress', 'Arcanist'],
            ['Shadowhunter', 'Deathblade']
    ]);

    const CombatEngravingStore = readable(['Adrenaline', 'All-Out Attack', 'Ambush Master', 'Awakening', 'Barricade', 'Broken Bone', 'Contender', 'Crisis Evasion', 'Crushing Fist', 'Cursed Doll', 'Disrespect', 'Divine Protection', 'Drops of Ether', 'Emergency Rescue', 'Enhanced Shield', 'Ether Predator', 'Expert', 'Explosive Expert', 'Fortitude', 'Grudge', 'Heavy Armor', 'Hit Master', 'Keen Blunt Weapon', 'Lightning Fury', 'Magick Stream', 'Mass Increase', 'Master Brawler', 'Master of Escape', 'Master\'s Tenacity', 'Max MP Increase', 'MP Efficiency Increase', 'Necromancy', 'Precise Dagger', 'Preemptive Strike', 'Propulsion', 'Raid Captain', 'Shield Piercing', 'Sight Focus', 'Spirit Absorption', 'Stabilized Status', 'Strong Will', 'Super Charge', 'Vital Point Hit']);

    const ClassEngravingStore = readable([
            {name: 'Berserker', engravings: ['Berserker\'s Technique', 'Mayhem']},
            {name: 'Paladin', engravings: ['Blessed Aura', 'Judgment']},
            {name: 'Gunlancer', engravings: ['Combat Readiness', 'Lone Knight']},
            {name: 'Destroyer', engravings: ['Gravity Training', 'Rage Hammer']},
            {name: 'Striker', engravings: ['Deathblow', 'Esoteric Flurry']},
            {name: 'Wardancer', engravings: ['Esoteric Skill', 'First Intention']},
            {name: 'Scrapper', engravings: ['Shock Training', 'Ultimate Skill: Taijutsu']},
            {name: 'Soulfist', engravings: ['Energy Overflow', 'Robust Spirit']},
            {name: 'Glaivier', engravings: ['Control', 'Pinnacle']},
            {name: 'Gunslinger', engravings: ['Peacemaker', 'Time to Hunt']},
            {name: 'Artillerist', engravings: ['Barrage Enhancement', 'Firepower Enhancement']},
            {name: 'Deadeye', engravings: ['Enhanced Weapon', 'Pistoleer']},
            {name: 'Sharpshooter', engravings: ['Death Strike', 'Loyal Companion']},
            {name: 'Bard', engravings: ['Desperate Salvation', 'True Courage']},
            {name: 'Sorceress', engravings: ['Igniter', 'Reflux']},
            {name: 'Arcanist', engravings: ['Empress\'s Grace', 'Order of the Emperor']},
            {name: 'Shadowhunter', engravings: ['Demonic Impulse', 'Perfect Surpression']},
            {name: 'Deathblade', engravings: ['Remaining Energy', 'Surge']}
    ]);

    /* src\shared\classDropdown.svelte generated by Svelte v3.49.0 */
    const file$5 = "src\\shared\\classDropdown.svelte";

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[11] = list[i];
    	child_ctx[13] = i;
    	return child_ctx;
    }

    function get_each_context_1$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[14] = list[i];
    	return child_ctx;
    }

    // (35:12) {#each $ClassStore[index] as advclass}
    function create_each_block_1$3(ctx) {
    	let div;
    	let t_value = /*advclass*/ ctx[14] + "";
    	let t;
    	let mounted;
    	let dispose;

    	function mousedown_handler() {
    		return /*mousedown_handler*/ ctx[8](/*advclass*/ ctx[14]);
    	}

    	function mousedown_handler_1() {
    		return /*mousedown_handler_1*/ ctx[9](/*advclass*/ ctx[14]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			attr_dev(div, "class", "dropdown-item svelte-110fttx");
    			add_location(div, file$5, 35, 16, 1230);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div, "mousedown", mousedown_handler, false, false, false),
    					listen_dev(div, "mousedown", mousedown_handler_1, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*$ClassStore*/ 8 && t_value !== (t_value = /*advclass*/ ctx[14] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$3.name,
    		type: "each",
    		source: "(35:12) {#each $ClassStore[index] as advclass}",
    		ctx
    	});

    	return block;
    }

    // (33:8) {#each $SurClassStore as surclass, index}
    function create_each_block$4(ctx) {
    	let div;
    	let t0_value = /*surclass*/ ctx[11] + "";
    	let t0;
    	let t1;
    	let each_1_anchor;
    	let each_value_1 = /*$ClassStore*/ ctx[3][/*index*/ ctx[13]];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$3(get_each_context_1$3(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text(t0_value);
    			t1 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    			attr_dev(div, "class", "dropdown-label svelte-110fttx");
    			add_location(div, file$5, 33, 12, 1118);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			insert_dev(target, t1, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$SurClassStore*/ 4 && t0_value !== (t0_value = /*surclass*/ ctx[11] + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*handleItemClick, $ClassStore, dispatch*/ 152) {
    				each_value_1 = /*$ClassStore*/ ctx[3][/*index*/ ctx[13]];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$3(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1$3(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching) detach_dev(t1);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$4.name,
    		type: "each",
    		source: "(33:8) {#each $SurClassStore as surclass, index}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let section;
    	let button;
    	let t0;
    	let t1;
    	let div0;
    	let svg;
    	let path0;
    	let path1;
    	let t2;
    	let div1;
    	let mounted;
    	let dispose;
    	let each_value = /*$SurClassStore*/ ctx[2];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			section = element("section");
    			button = element("button");
    			t0 = text(/*value*/ ctx[0]);
    			t1 = space();
    			div0 = element("div");
    			svg = svg_element("svg");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			t2 = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(button, "type", "button");
    			attr_dev(button, "class", "dropdown-button svelte-110fttx");
    			toggle_class(button, "empty", /*value*/ ctx[0] === "Choose Class");
    			add_location(button, file$5, 27, 4, 660);
    			attr_dev(path0, "d", "M0 0h24v24H0z");
    			attr_dev(path0, "fill", "none");
    			attr_dev(path0, "class", "svelte-110fttx");
    			add_location(path0, file$5, 29, 68, 901);
    			attr_dev(path1, "d", "M7 10l5 5 5-5z");
    			attr_dev(path1, "class", "svelte-110fttx");
    			add_location(path1, file$5, 29, 111, 944);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 24 24");
    			attr_dev(svg, "class", "svelte-110fttx");
    			add_location(svg, file$5, 29, 8, 841);
    			attr_dev(div0, "class", "dropdown-arrow svelte-110fttx");
    			add_location(div0, file$5, 28, 4, 803);
    			attr_dev(div1, "class", "dropdown-content svelte-110fttx");
    			toggle_class(div1, "show", /*isFocused*/ ctx[1]);
    			add_location(div1, file$5, 31, 4, 1000);
    			attr_dev(section, "class", "select-dropdown-container svelte-110fttx");
    			add_location(section, file$5, 26, 0, 611);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, button);
    			append_dev(button, t0);
    			append_dev(section, t1);
    			append_dev(section, div0);
    			append_dev(div0, svg);
    			append_dev(svg, path0);
    			append_dev(svg, path1);
    			append_dev(section, t2);
    			append_dev(section, div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			if (!mounted) {
    				dispose = [
    					listen_dev(button, "focus", /*onFocus*/ ctx[5], false, false, false),
    					listen_dev(button, "blur", /*onBlur*/ ctx[6], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*value*/ 1) set_data_dev(t0, /*value*/ ctx[0]);

    			if (dirty & /*value*/ 1) {
    				toggle_class(button, "empty", /*value*/ ctx[0] === "Choose Class");
    			}

    			if (dirty & /*$ClassStore, handleItemClick, dispatch, $SurClassStore*/ 156) {
    				each_value = /*$SurClassStore*/ ctx[2];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$4(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$4(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*isFocused*/ 2) {
    				toggle_class(div1, "show", /*isFocused*/ ctx[1]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let $SelectedClass;
    	let $SurClassStore;
    	let $ClassStore;
    	validate_store(SelectedClass, 'SelectedClass');
    	component_subscribe($$self, SelectedClass, $$value => $$invalidate(10, $SelectedClass = $$value));
    	validate_store(SurClassStore, 'SurClassStore');
    	component_subscribe($$self, SurClassStore, $$value => $$invalidate(2, $SurClassStore = $$value));
    	validate_store(ClassStore, 'ClassStore');
    	component_subscribe($$self, ClassStore, $$value => $$invalidate(3, $ClassStore = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ClassDropdown', slots, []);
    	const dispatch = createEventDispatcher();
    	let value = "Choose Class";
    	let isFocused = false;

    	const onFocus = () => {
    		$$invalidate(1, isFocused = true);
    	};

    	const onBlur = () => {
    		$$invalidate(1, isFocused = false);
    	};

    	const handleItemClick = item => {
    		$$invalidate(0, value = item);
    		set_store_value(SelectedClass, $SelectedClass = item, $SelectedClass);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ClassDropdown> was created with unknown prop '${key}'`);
    	});

    	const mousedown_handler = advclass => handleItemClick(advclass);
    	const mousedown_handler_1 = advclass => dispatch('valueChange', advclass);

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		SelectedClass,
    		SurClassStore,
    		ClassStore,
    		dispatch,
    		value,
    		isFocused,
    		onFocus,
    		onBlur,
    		handleItemClick,
    		$SelectedClass,
    		$SurClassStore,
    		$ClassStore
    	});

    	$$self.$inject_state = $$props => {
    		if ('value' in $$props) $$invalidate(0, value = $$props.value);
    		if ('isFocused' in $$props) $$invalidate(1, isFocused = $$props.isFocused);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		value,
    		isFocused,
    		$SurClassStore,
    		$ClassStore,
    		dispatch,
    		onFocus,
    		onBlur,
    		handleItemClick,
    		mousedown_handler,
    		mousedown_handler_1
    	];
    }

    class ClassDropdown extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ClassDropdown",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src\shared\filterDropdown.svelte generated by Svelte v3.49.0 */
    const file$4 = "src\\shared\\filterDropdown.svelte";

    function get_each_context_1$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[19] = list[i];
    	return child_ctx;
    }

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[19] = list[i];
    	return child_ctx;
    }

    // (45:8) {:else}
    function create_else_block$1(ctx) {
    	let each_1_anchor;
    	let each_value_1 = /*menuItems*/ ctx[1];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$2(get_each_context_1$2(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*fontSize, handleItemClick, menuItems, dispatch*/ 4370) {
    				each_value_1 = /*menuItems*/ ctx[1];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$2(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(45:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (41:8) {#if filteredItems.length > 0}
    function create_if_block$2(ctx) {
    	let each_1_anchor;
    	let each_value = /*filteredItems*/ ctx[6];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*fontSize, handleItemClick, filteredItems, dispatch*/ 4432) {
    				each_value = /*filteredItems*/ ctx[6];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(41:8) {#if filteredItems.length > 0}",
    		ctx
    	});

    	return block;
    }

    // (46:12) {#each menuItems as item}
    function create_each_block_1$2(ctx) {
    	let div;
    	let t_value = /*item*/ ctx[19] + "";
    	let t;
    	let mounted;
    	let dispose;

    	function mousedown_handler_2() {
    		return /*mousedown_handler_2*/ ctx[17](/*item*/ ctx[19]);
    	}

    	function mousedown_handler_3() {
    		return /*mousedown_handler_3*/ ctx[18](/*item*/ ctx[19]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			attr_dev(div, "class", "dropdown-item svelte-n052h3");
    			set_style(div, "font-size", /*fontSize*/ ctx[4]);
    			add_location(div, file$4, 46, 16, 1697);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div, "mousedown", mousedown_handler_2, false, false, false),
    					listen_dev(div, "mousedown", mousedown_handler_3, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*menuItems*/ 2 && t_value !== (t_value = /*item*/ ctx[19] + "")) set_data_dev(t, t_value);

    			if (dirty & /*fontSize*/ 16) {
    				set_style(div, "font-size", /*fontSize*/ ctx[4]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$2.name,
    		type: "each",
    		source: "(46:12) {#each menuItems as item}",
    		ctx
    	});

    	return block;
    }

    // (42:12) {#each filteredItems as item}
    function create_each_block$3(ctx) {
    	let div;
    	let t_value = /*item*/ ctx[19] + "";
    	let t;
    	let mounted;
    	let dispose;

    	function mousedown_handler() {
    		return /*mousedown_handler*/ ctx[15](/*item*/ ctx[19]);
    	}

    	function mousedown_handler_1() {
    		return /*mousedown_handler_1*/ ctx[16](/*item*/ ctx[19]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			attr_dev(div, "class", "dropdown-item svelte-n052h3");
    			set_style(div, "font-size", /*fontSize*/ ctx[4]);
    			add_location(div, file$4, 42, 16, 1439);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div, "mousedown", mousedown_handler, false, false, false),
    					listen_dev(div, "mousedown", mousedown_handler_1, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*filteredItems*/ 64 && t_value !== (t_value = /*item*/ ctx[19] + "")) set_data_dev(t, t_value);

    			if (dirty & /*fontSize*/ 16) {
    				set_style(div, "font-size", /*fontSize*/ ctx[4]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(42:12) {#each filteredItems as item}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let section;
    	let input;
    	let t0;
    	let div0;
    	let svg;
    	let path0;
    	let path1;
    	let t1;
    	let div1;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*filteredItems*/ ctx[6].length > 0) return create_if_block$2;
    		return create_else_block$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			section = element("section");
    			input = element("input");
    			t0 = space();
    			div0 = element("div");
    			svg = svg_element("svg");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			t1 = space();
    			div1 = element("div");
    			if_block.c();
    			attr_dev(input, "type", "text");
    			attr_dev(input, "placeholder", /*placeholderText*/ ctx[2]);
    			set_style(input, "width", /*width*/ ctx[3]);
    			set_style(input, "font-size", /*fontSize*/ ctx[4]);
    			attr_dev(input, "onclick", "this.select();");
    			attr_dev(input, "class", "dropdown-input svelte-n052h3");
    			input.disabled = /*disabled*/ ctx[5];
    			add_location(input, file$4, 35, 4, 813);
    			attr_dev(path0, "d", "M0 0h24v24H0z");
    			attr_dev(path0, "fill", "none");
    			attr_dev(path0, "class", "svelte-n052h3");
    			add_location(path0, file$4, 37, 68, 1186);
    			attr_dev(path1, "d", "M7 10l5 5 5-5z");
    			attr_dev(path1, "class", "svelte-n052h3");
    			add_location(path1, file$4, 37, 111, 1229);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 24 24");
    			attr_dev(svg, "class", "svelte-n052h3");
    			add_location(svg, file$4, 37, 8, 1126);
    			attr_dev(div0, "class", "dropdown-arrow svelte-n052h3");
    			add_location(div0, file$4, 36, 4, 1088);
    			attr_dev(div1, "class", "dropdown-content svelte-n052h3");
    			toggle_class(div1, "show", /*isFocused*/ ctx[7]);
    			add_location(div1, file$4, 39, 4, 1285);
    			attr_dev(section, "class", "dropdown-container svelte-n052h3");
    			add_location(section, file$4, 34, 0, 771);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, input);
    			set_input_value(input, /*inputValue*/ ctx[0]);
    			append_dev(section, t0);
    			append_dev(section, div0);
    			append_dev(div0, svg);
    			append_dev(svg, path0);
    			append_dev(svg, path1);
    			append_dev(section, t1);
    			append_dev(section, div1);
    			if_block.m(div1, null);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "focus", /*onFocus*/ ctx[9], false, false, false),
    					listen_dev(input, "blur", /*onBlur*/ ctx[10], false, false, false),
    					listen_dev(input, "blur", /*blur_handler*/ ctx[13], false, false, false),
    					listen_dev(input, "input", /*input_input_handler*/ ctx[14]),
    					listen_dev(input, "input", /*handleInput*/ ctx[11], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*placeholderText*/ 4) {
    				attr_dev(input, "placeholder", /*placeholderText*/ ctx[2]);
    			}

    			if (dirty & /*width*/ 8) {
    				set_style(input, "width", /*width*/ ctx[3]);
    			}

    			if (dirty & /*fontSize*/ 16) {
    				set_style(input, "font-size", /*fontSize*/ ctx[4]);
    			}

    			if (dirty & /*disabled*/ 32) {
    				prop_dev(input, "disabled", /*disabled*/ ctx[5]);
    			}

    			if (dirty & /*inputValue*/ 1 && input.value !== /*inputValue*/ ctx[0]) {
    				set_input_value(input, /*inputValue*/ ctx[0]);
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div1, null);
    				}
    			}

    			if (dirty & /*isFocused*/ 128) {
    				toggle_class(div1, "show", /*isFocused*/ ctx[7]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('FilterDropdown', slots, []);
    	const dispatch = createEventDispatcher();
    	let { inputValue = "" } = $$props;
    	let { menuItems = ['No items'] } = $$props;
    	let { placeholderText } = $$props;
    	let { width = '100px' } = $$props;
    	let { fontSize = '12px' } = $$props;
    	let { disabled = false } = $$props;
    	let filteredItems = [];
    	let isFocused = false;

    	const onFocus = () => {
    		$$invalidate(7, isFocused = true);
    		handleInput();
    	};

    	const onBlur = () => {
    		$$invalidate(7, isFocused = false);
    	};

    	const handleInput = () => {
    		return $$invalidate(6, filteredItems = menuItems.filter(item => item.toLowerCase().match(inputValue.toLowerCase())));
    	};

    	const handleItemClick = item => {
    		$$invalidate(0, inputValue = "");
    	};

    	const writable_props = ['inputValue', 'menuItems', 'placeholderText', 'width', 'fontSize', 'disabled'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<FilterDropdown> was created with unknown prop '${key}'`);
    	});

    	const blur_handler = () => dispatch('blur');

    	function input_input_handler() {
    		inputValue = this.value;
    		$$invalidate(0, inputValue);
    	}

    	const mousedown_handler = item => handleItemClick();
    	const mousedown_handler_1 = item => dispatch('valueChange', { item });
    	const mousedown_handler_2 = item => handleItemClick();
    	const mousedown_handler_3 = item => dispatch('valueChange', { item });

    	$$self.$$set = $$props => {
    		if ('inputValue' in $$props) $$invalidate(0, inputValue = $$props.inputValue);
    		if ('menuItems' in $$props) $$invalidate(1, menuItems = $$props.menuItems);
    		if ('placeholderText' in $$props) $$invalidate(2, placeholderText = $$props.placeholderText);
    		if ('width' in $$props) $$invalidate(3, width = $$props.width);
    		if ('fontSize' in $$props) $$invalidate(4, fontSize = $$props.fontSize);
    		if ('disabled' in $$props) $$invalidate(5, disabled = $$props.disabled);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		dispatch,
    		inputValue,
    		menuItems,
    		placeholderText,
    		width,
    		fontSize,
    		disabled,
    		filteredItems,
    		isFocused,
    		onFocus,
    		onBlur,
    		handleInput,
    		handleItemClick
    	});

    	$$self.$inject_state = $$props => {
    		if ('inputValue' in $$props) $$invalidate(0, inputValue = $$props.inputValue);
    		if ('menuItems' in $$props) $$invalidate(1, menuItems = $$props.menuItems);
    		if ('placeholderText' in $$props) $$invalidate(2, placeholderText = $$props.placeholderText);
    		if ('width' in $$props) $$invalidate(3, width = $$props.width);
    		if ('fontSize' in $$props) $$invalidate(4, fontSize = $$props.fontSize);
    		if ('disabled' in $$props) $$invalidate(5, disabled = $$props.disabled);
    		if ('filteredItems' in $$props) $$invalidate(6, filteredItems = $$props.filteredItems);
    		if ('isFocused' in $$props) $$invalidate(7, isFocused = $$props.isFocused);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		inputValue,
    		menuItems,
    		placeholderText,
    		width,
    		fontSize,
    		disabled,
    		filteredItems,
    		isFocused,
    		dispatch,
    		onFocus,
    		onBlur,
    		handleInput,
    		handleItemClick,
    		blur_handler,
    		input_input_handler,
    		mousedown_handler,
    		mousedown_handler_1,
    		mousedown_handler_2,
    		mousedown_handler_3
    	];
    }

    class FilterDropdown extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {
    			inputValue: 0,
    			menuItems: 1,
    			placeholderText: 2,
    			width: 3,
    			fontSize: 4,
    			disabled: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FilterDropdown",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*placeholderText*/ ctx[2] === undefined && !('placeholderText' in props)) {
    			console.warn("<FilterDropdown> was created without expected prop 'placeholderText'");
    		}
    	}

    	get inputValue() {
    		throw new Error("<FilterDropdown>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set inputValue(value) {
    		throw new Error("<FilterDropdown>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get menuItems() {
    		throw new Error("<FilterDropdown>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set menuItems(value) {
    		throw new Error("<FilterDropdown>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get placeholderText() {
    		throw new Error("<FilterDropdown>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set placeholderText(value) {
    		throw new Error("<FilterDropdown>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get width() {
    		throw new Error("<FilterDropdown>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set width(value) {
    		throw new Error("<FilterDropdown>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fontSize() {
    		throw new Error("<FilterDropdown>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fontSize(value) {
    		throw new Error("<FilterDropdown>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<FilterDropdown>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<FilterDropdown>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\shared\selectDropdown.svelte generated by Svelte v3.49.0 */
    const file$3 = "src\\shared\\selectDropdown.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[14] = list[i];
    	return child_ctx;
    }

    // (36:8) {#each menuItems as item}
    function create_each_block$2(ctx) {
    	let div;
    	let t_value = /*item*/ ctx[14] + "";
    	let t;
    	let mounted;
    	let dispose;

    	function mousedown_handler() {
    		return /*mousedown_handler*/ ctx[12](/*item*/ ctx[14]);
    	}

    	function mousedown_handler_1() {
    		return /*mousedown_handler_1*/ ctx[13](/*item*/ ctx[14]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			attr_dev(div, "class", "dropdown-item svelte-ecpgc9");
    			set_style(div, "font-size", /*fontSize*/ ctx[3]);
    			add_location(div, file$3, 36, 12, 1203);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div, "mousedown", mousedown_handler, false, false, false),
    					listen_dev(div, "mousedown", mousedown_handler_1, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*menuItems*/ 2 && t_value !== (t_value = /*item*/ ctx[14] + "")) set_data_dev(t, t_value);

    			if (dirty & /*fontSize*/ 8) {
    				set_style(div, "font-size", /*fontSize*/ ctx[3]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(36:8) {#each menuItems as item}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let section;
    	let button;
    	let t0;
    	let t1;
    	let div0;
    	let svg;
    	let path0;
    	let path1;
    	let t2;
    	let div1;
    	let mounted;
    	let dispose;
    	let each_value = /*menuItems*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			section = element("section");
    			button = element("button");
    			t0 = text(/*value*/ ctx[0]);
    			t1 = space();
    			div0 = element("div");
    			svg = svg_element("svg");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			t2 = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(button, "type", "button");
    			set_style(button, "width", /*width*/ ctx[2]);
    			set_style(button, "font-size", /*fontSize*/ ctx[3]);
    			attr_dev(button, "class", "dropdown-button svelte-ecpgc9");
    			button.disabled = /*disabled*/ ctx[5];
    			toggle_class(button, "null-value", /*firstValueNull*/ ctx[6] && /*value*/ ctx[0] === /*menuItems*/ ctx[1][0]);
    			add_location(button, file$3, 30, 4, 685);
    			attr_dev(path0, "d", "M0 0h24v24H0z");
    			attr_dev(path0, "fill", "none");
    			attr_dev(path0, "class", "svelte-ecpgc9");
    			add_location(path0, file$3, 32, 68, 1002);
    			attr_dev(path1, "d", "M7 10l5 5 5-5z");
    			attr_dev(path1, "class", "svelte-ecpgc9");
    			add_location(path1, file$3, 32, 111, 1045);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 24 24");
    			attr_dev(svg, "class", "svelte-ecpgc9");
    			add_location(svg, file$3, 32, 8, 942);
    			attr_dev(div0, "class", "dropdown-arrow svelte-ecpgc9");
    			add_location(div0, file$3, 31, 4, 904);
    			attr_dev(div1, "class", "dropdown-content svelte-ecpgc9");
    			toggle_class(div1, "show", /*isFocused*/ ctx[7]);
    			add_location(div1, file$3, 34, 4, 1101);
    			attr_dev(section, "class", "select-dropdown-container svelte-ecpgc9");
    			add_location(section, file$3, 29, 0, 636);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, button);
    			append_dev(button, t0);
    			append_dev(section, t1);
    			append_dev(section, div0);
    			append_dev(div0, svg);
    			append_dev(svg, path0);
    			append_dev(svg, path1);
    			append_dev(section, t2);
    			append_dev(section, div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			if (!mounted) {
    				dispose = [
    					listen_dev(button, "focus", /*onFocus*/ ctx[9], false, false, false),
    					listen_dev(button, "blur", /*onBlur*/ ctx[10], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*value*/ 1) set_data_dev(t0, /*value*/ ctx[0]);

    			if (dirty & /*width*/ 4) {
    				set_style(button, "width", /*width*/ ctx[2]);
    			}

    			if (dirty & /*fontSize*/ 8) {
    				set_style(button, "font-size", /*fontSize*/ ctx[3]);
    			}

    			if (dirty & /*disabled*/ 32) {
    				prop_dev(button, "disabled", /*disabled*/ ctx[5]);
    			}

    			if (dirty & /*firstValueNull, value, menuItems*/ 67) {
    				toggle_class(button, "null-value", /*firstValueNull*/ ctx[6] && /*value*/ ctx[0] === /*menuItems*/ ctx[1][0]);
    			}

    			if (dirty & /*fontSize, handleItemClick, menuItems, dispatch, id*/ 2330) {
    				each_value = /*menuItems*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*isFocused*/ 128) {
    				toggle_class(div1, "show", /*isFocused*/ ctx[7]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('SelectDropdown', slots, []);
    	const dispatch = createEventDispatcher();
    	let { value = "-" } = $$props;
    	let { menuItems = ['No items'] } = $$props;
    	let { width = '100px' } = $$props;
    	let { fontSize = '12px' } = $$props;
    	let { id = 0 } = $$props;
    	let { disabled = false } = $$props;
    	let { firstValueNull = false } = $$props;
    	let isFocused = false;

    	const onFocus = () => {
    		$$invalidate(7, isFocused = true);
    	};

    	const onBlur = () => {
    		$$invalidate(7, isFocused = false);
    	};

    	const handleItemClick = item => {
    		$$invalidate(0, value = item);
    	};

    	const writable_props = ['value', 'menuItems', 'width', 'fontSize', 'id', 'disabled', 'firstValueNull'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<SelectDropdown> was created with unknown prop '${key}'`);
    	});

    	const mousedown_handler = item => handleItemClick(item);
    	const mousedown_handler_1 = item => dispatch('valueChange', { item, id });

    	$$self.$$set = $$props => {
    		if ('value' in $$props) $$invalidate(0, value = $$props.value);
    		if ('menuItems' in $$props) $$invalidate(1, menuItems = $$props.menuItems);
    		if ('width' in $$props) $$invalidate(2, width = $$props.width);
    		if ('fontSize' in $$props) $$invalidate(3, fontSize = $$props.fontSize);
    		if ('id' in $$props) $$invalidate(4, id = $$props.id);
    		if ('disabled' in $$props) $$invalidate(5, disabled = $$props.disabled);
    		if ('firstValueNull' in $$props) $$invalidate(6, firstValueNull = $$props.firstValueNull);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		createEventDispatcher,
    		dispatch,
    		value,
    		menuItems,
    		width,
    		fontSize,
    		id,
    		disabled,
    		firstValueNull,
    		isFocused,
    		onFocus,
    		onBlur,
    		handleItemClick
    	});

    	$$self.$inject_state = $$props => {
    		if ('value' in $$props) $$invalidate(0, value = $$props.value);
    		if ('menuItems' in $$props) $$invalidate(1, menuItems = $$props.menuItems);
    		if ('width' in $$props) $$invalidate(2, width = $$props.width);
    		if ('fontSize' in $$props) $$invalidate(3, fontSize = $$props.fontSize);
    		if ('id' in $$props) $$invalidate(4, id = $$props.id);
    		if ('disabled' in $$props) $$invalidate(5, disabled = $$props.disabled);
    		if ('firstValueNull' in $$props) $$invalidate(6, firstValueNull = $$props.firstValueNull);
    		if ('isFocused' in $$props) $$invalidate(7, isFocused = $$props.isFocused);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		value,
    		menuItems,
    		width,
    		fontSize,
    		id,
    		disabled,
    		firstValueNull,
    		isFocused,
    		dispatch,
    		onFocus,
    		onBlur,
    		handleItemClick,
    		mousedown_handler,
    		mousedown_handler_1
    	];
    }

    class SelectDropdown extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {
    			value: 0,
    			menuItems: 1,
    			width: 2,
    			fontSize: 3,
    			id: 4,
    			disabled: 5,
    			firstValueNull: 6
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SelectDropdown",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get value() {
    		throw new Error("<SelectDropdown>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<SelectDropdown>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get menuItems() {
    		throw new Error("<SelectDropdown>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set menuItems(value) {
    		throw new Error("<SelectDropdown>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get width() {
    		throw new Error("<SelectDropdown>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set width(value) {
    		throw new Error("<SelectDropdown>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fontSize() {
    		throw new Error("<SelectDropdown>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fontSize(value) {
    		throw new Error("<SelectDropdown>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get id() {
    		throw new Error("<SelectDropdown>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<SelectDropdown>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<SelectDropdown>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<SelectDropdown>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get firstValueNull() {
    		throw new Error("<SelectDropdown>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set firstValueNull(value) {
    		throw new Error("<SelectDropdown>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    function fade(node, { delay = 0, duration = 400, easing = identity } = {}) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }
    function fly(node, { delay = 0, duration = 400, easing = cubicOut, x = 0, y = 0, opacity = 0 } = {}) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (t, u) => `
			transform: ${transform} translate(${(1 - t) * x}px, ${(1 - t) * y}px);
			opacity: ${target_opacity - (od * u)}`
        };
    }
    function slide(node, { delay = 0, duration = 400, easing = cubicOut } = {}) {
        const style = getComputedStyle(node);
        const opacity = +style.opacity;
        const height = parseFloat(style.height);
        const padding_top = parseFloat(style.paddingTop);
        const padding_bottom = parseFloat(style.paddingBottom);
        const margin_top = parseFloat(style.marginTop);
        const margin_bottom = parseFloat(style.marginBottom);
        const border_top_width = parseFloat(style.borderTopWidth);
        const border_bottom_width = parseFloat(style.borderBottomWidth);
        return {
            delay,
            duration,
            easing,
            css: t => 'overflow: hidden;' +
                `opacity: ${Math.min(t * 20, 1) * opacity};` +
                `height: ${t * height}px;` +
                `padding-top: ${t * padding_top}px;` +
                `padding-bottom: ${t * padding_bottom}px;` +
                `margin-top: ${t * margin_top}px;` +
                `margin-bottom: ${t * margin_bottom}px;` +
                `border-top-width: ${t * border_top_width}px;` +
                `border-bottom-width: ${t * border_bottom_width}px;`
        };
    }

    /* src\components\engraving-row.svelte generated by Svelte v3.49.0 */

    const { console: console_1$1 } = globals;
    const file$2 = "src\\components\\engraving-row.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[45] = list[i];
    	child_ctx[47] = i;
    	return child_ctx;
    }

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[45] = list[i];
    	child_ctx[47] = i;
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[45] = list[i];
    	child_ctx[47] = i;
    	return child_ctx;
    }

    // (188:12) {:else}
    function create_else_block_6(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = /*emptyNodeSRC*/ ctx[10])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Engraving Node");
    			attr_dev(img, "class", "node svelte-inzqfp");
    			add_location(img, file$2, 188, 16, 7518);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*emptyNodeSRC*/ 1024 && !src_url_equal(img.src, img_src_value = /*emptyNodeSRC*/ ctx[10])) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_6.name,
    		type: "else",
    		source: "(188:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (182:12) {#if engravingNodesValue - i > 0}
    function create_if_block_6(ctx) {
    	let if_block_anchor;

    	function select_block_type_1(ctx, dirty) {
    		if (/*engravingNodesValue*/ ctx[7] >= 5) return create_if_block_7;
    		return create_else_block_5;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(182:12) {#if engravingNodesValue - i > 0}",
    		ctx
    	});

    	return block;
    }

    // (185:16) {:else}
    function create_else_block_5(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = /*filledNodeSRC*/ ctx[9])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Engraving Node");
    			attr_dev(img, "class", "node svelte-inzqfp");
    			add_location(img, file$2, 185, 20, 7397);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*filledNodeSRC*/ 512 && !src_url_equal(img.src, img_src_value = /*filledNodeSRC*/ ctx[9])) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_5.name,
    		type: "else",
    		source: "(185:16) {:else}",
    		ctx
    	});

    	return block;
    }

    // (183:16) {#if engravingNodesValue >= 5}
    function create_if_block_7(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = /*activeNodeSRC*/ ctx[8])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Engraving Node");
    			attr_dev(img, "class", "node svelte-inzqfp");
    			add_location(img, file$2, 183, 20, 7291);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*activeNodeSRC*/ 256 && !src_url_equal(img.src, img_src_value = /*activeNodeSRC*/ ctx[8])) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7.name,
    		type: "if",
    		source: "(183:16) {#if engravingNodesValue >= 5}",
    		ctx
    	});

    	return block;
    }

    // (181:8) {#each {length:5} as _, i}
    function create_each_block_2(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*engravingNodesValue*/ ctx[7] - /*i*/ ctx[47] > 0) return create_if_block_6;
    		return create_else_block_6;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(181:8) {#each {length:5} as _, i}",
    		ctx
    	});

    	return block;
    }

    // (201:12) {:else}
    function create_else_block_4(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = /*emptyNodeSRC*/ ctx[10])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Engraving Node");
    			attr_dev(img, "class", "node svelte-inzqfp");
    			add_location(img, file$2, 201, 16, 8055);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*emptyNodeSRC*/ 1024 && !src_url_equal(img.src, img_src_value = /*emptyNodeSRC*/ ctx[10])) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_4.name,
    		type: "else",
    		source: "(201:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (195:12) {#if engravingNodesValue - i - 5 > 0}
    function create_if_block_4(ctx) {
    	let if_block_anchor;

    	function select_block_type_3(ctx, dirty) {
    		if (/*engravingNodesValue*/ ctx[7] >= 10) return create_if_block_5;
    		return create_else_block_3;
    	}

    	let current_block_type = select_block_type_3(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type_3(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(195:12) {#if engravingNodesValue - i - 5 > 0}",
    		ctx
    	});

    	return block;
    }

    // (198:16) {:else}
    function create_else_block_3(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = /*filledNodeSRC*/ ctx[9])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Engraving Node");
    			attr_dev(img, "class", "node svelte-inzqfp");
    			add_location(img, file$2, 198, 20, 7934);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*filledNodeSRC*/ 512 && !src_url_equal(img.src, img_src_value = /*filledNodeSRC*/ ctx[9])) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_3.name,
    		type: "else",
    		source: "(198:16) {:else}",
    		ctx
    	});

    	return block;
    }

    // (196:16) {#if engravingNodesValue >= 10}
    function create_if_block_5(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = /*activeNodeSRC*/ ctx[8])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Engraving Node");
    			attr_dev(img, "class", "node svelte-inzqfp");
    			add_location(img, file$2, 196, 20, 7828);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*activeNodeSRC*/ 256 && !src_url_equal(img.src, img_src_value = /*activeNodeSRC*/ ctx[8])) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(196:16) {#if engravingNodesValue >= 10}",
    		ctx
    	});

    	return block;
    }

    // (194:8) {#each {length:5} as _, i}
    function create_each_block_1$1(ctx) {
    	let if_block_anchor;

    	function select_block_type_2(ctx, dirty) {
    		if (/*engravingNodesValue*/ ctx[7] - /*i*/ ctx[47] - 5 > 0) return create_if_block_4;
    		return create_else_block_4;
    	}

    	let current_block_type = select_block_type_2(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type_2(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$1.name,
    		type: "each",
    		source: "(194:8) {#each {length:5} as _, i}",
    		ctx
    	});

    	return block;
    }

    // (214:12) {:else}
    function create_else_block_2(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = /*emptyNodeSRC*/ ctx[10])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Engraving Node");
    			attr_dev(img, "class", "node svelte-inzqfp");
    			add_location(img, file$2, 214, 16, 8593);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*emptyNodeSRC*/ 1024 && !src_url_equal(img.src, img_src_value = /*emptyNodeSRC*/ ctx[10])) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_2.name,
    		type: "else",
    		source: "(214:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (208:12) {#if engravingNodesValue - i - 10 > 0}
    function create_if_block_2(ctx) {
    	let if_block_anchor;

    	function select_block_type_5(ctx, dirty) {
    		if (/*engravingNodesValue*/ ctx[7] >= 15) return create_if_block_3;
    		return create_else_block_1;
    	}

    	let current_block_type = select_block_type_5(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type_5(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(208:12) {#if engravingNodesValue - i - 10 > 0}",
    		ctx
    	});

    	return block;
    }

    // (211:16) {:else}
    function create_else_block_1(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = /*filledNodeSRC*/ ctx[9])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Engraving Node");
    			attr_dev(img, "class", "node svelte-inzqfp");
    			add_location(img, file$2, 211, 20, 8472);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*filledNodeSRC*/ 512 && !src_url_equal(img.src, img_src_value = /*filledNodeSRC*/ ctx[9])) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(211:16) {:else}",
    		ctx
    	});

    	return block;
    }

    // (209:16) {#if engravingNodesValue >= 15}
    function create_if_block_3(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = /*activeNodeSRC*/ ctx[8])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Engraving Node");
    			attr_dev(img, "class", "node svelte-inzqfp");
    			add_location(img, file$2, 209, 20, 8366);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*activeNodeSRC*/ 256 && !src_url_equal(img.src, img_src_value = /*activeNodeSRC*/ ctx[8])) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(209:16) {#if engravingNodesValue >= 15}",
    		ctx
    	});

    	return block;
    }

    // (207:8) {#each {length:5} as _, i}
    function create_each_block$1(ctx) {
    	let if_block_anchor;

    	function select_block_type_4(ctx, dirty) {
    		if (/*engravingNodesValue*/ ctx[7] - /*i*/ ctx[47] - 10 > 0) return create_if_block_2;
    		return create_else_block_2;
    	}

    	let current_block_type = select_block_type_4(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type_4(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(207:8) {#each {length:5} as _, i}",
    		ctx
    	});

    	return block;
    }

    // (223:12) {:else}
    function create_else_block(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("-");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(223:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (221:12) {#if engravingNodesValue > 15}
    function create_if_block_1(ctx) {
    	let t0;
    	let t1_value = /*engravingNodesValue*/ ctx[7] - 15 + "";
    	let t1;

    	const block = {
    		c: function create() {
    			t0 = text("+");
    			t1 = text(t1_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*engravingNodesValue*/ 128 && t1_value !== (t1_value = /*engravingNodesValue*/ ctx[7] - 15 + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(221:12) {#if engravingNodesValue > 15}",
    		ctx
    	});

    	return block;
    }

    // (264:0) {#if !addEngravingRow & !negativeEngraving}
    function create_if_block$1(ctx) {
    	let div;
    	let svg;
    	let path0;
    	let path1;
    	let path2;
    	let div_intro;
    	let div_outro;
    	let current;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			svg = svg_element("svg");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			path2 = svg_element("path");
    			attr_dev(path0, "d", "M0 0h24v24H0z");
    			attr_dev(path0, "fill", "none");
    			add_location(path0, file$2, 265, 143, 11828);
    			attr_dev(path1, "d", "M0 0h24v24H0V0z");
    			attr_dev(path1, "fill", "none");
    			add_location(path1, file$2, 265, 186, 11871);
    			attr_dev(path2, "d", "M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zm2.46-7.12l1.41-1.41L12 12.59l2.12-2.12 1.41 1.41L13.41 14l2.12 2.12-1.41 1.41L12 15.41l-2.12 2.12-1.41-1.41L10.59 14l-2.13-2.12zM15.5 4l-1-1h-5l-1 1H5v2h14V4z");
    			add_location(path2, file$2, 265, 231, 11916);
    			attr_dev(svg, "width", "24");
    			attr_dev(svg, "height", "24");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 24 24");
    			attr_dev(svg, "color", "#000");
    			attr_dev(svg, "class", "delete svelte-inzqfp");
    			add_location(svg, file$2, 265, 8, 11693);
    			set_style(div, "position", "relative");
    			set_style(div, "width", "0");
    			set_style(div, "height", "0");
    			add_location(div, file$2, 264, 4, 11584);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, svg);
    			append_dev(svg, path0);
    			append_dev(svg, path1);
    			append_dev(svg, path2);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(svg, "click", /*handleDelete*/ ctx[22], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (div_outro) div_outro.end(1);
    				div_intro = create_in_transition(div, fly, { y: 40, duration: 1000 });
    				div_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (div_intro) div_intro.invalidate();
    			div_outro = create_out_transition(div, fade, {});
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching && div_outro) div_outro.end();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(264:0) {#if !addEngravingRow & !negativeEngraving}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let tr;
    	let td0;
    	let img;
    	let img_src_value;
    	let t0;
    	let div0;
    	let filterdropdown;
    	let updating_inputValue;
    	let t1;
    	let td1;
    	let t2;
    	let td2;
    	let t3;
    	let td3;
    	let t4;
    	let td4;
    	let h4;
    	let t5;
    	let td5;
    	let div1;
    	let selectdropdown0;
    	let updating_value;
    	let t6;
    	let td6;
    	let div2;
    	let selectdropdown1;
    	let updating_value_1;
    	let t7;
    	let td7;
    	let div3;
    	let selectdropdown2;
    	let updating_value_2;
    	let t8;
    	let td8;
    	let div4;
    	let selectdropdown3;
    	let updating_value_3;
    	let t9;
    	let td9;
    	let div5;
    	let selectdropdown4;
    	let updating_value_4;
    	let t10;
    	let td10;
    	let div6;
    	let selectdropdown5;
    	let updating_value_5;
    	let t11;
    	let td11;
    	let div7;
    	let selectdropdown6;
    	let updating_value_6;
    	let tr_intro;
    	let tr_outro;
    	let t12;
    	let if_block1_anchor;
    	let current;
    	let mounted;
    	let dispose;

    	function filterdropdown_inputValue_binding(value) {
    		/*filterdropdown_inputValue_binding*/ ctx[27](value);
    	}

    	let filterdropdown_props = {
    		menuItems: /*engravingMenuItems*/ ctx[5],
    		placeholderText: "Add Engraving",
    		width: "150px",
    		fontSize: "12px",
    		disabled: /*negativeEngraving*/ ctx[3]
    	};

    	if (/*engravingInput*/ ctx[4] !== void 0) {
    		filterdropdown_props.inputValue = /*engravingInput*/ ctx[4];
    	}

    	filterdropdown = new FilterDropdown({
    			props: filterdropdown_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(filterdropdown, 'inputValue', filterdropdown_inputValue_binding));
    	filterdropdown.$on("blur", /*engravingDropdownBlur*/ ctx[21]);
    	filterdropdown.$on("valueChange", /*engravingChange*/ ctx[19]);
    	let each_value_2 = { length: 5 };
    	validate_each_argument(each_value_2);
    	let each_blocks_2 = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks_2[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	let each_value_1 = { length: 5 };
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
    	}

    	let each_value = { length: 5 };
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	function select_block_type_6(ctx, dirty) {
    		if (/*engravingNodesValue*/ ctx[7] > 15) return create_if_block_1;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type_6(ctx);
    	let if_block0 = current_block_type(ctx);

    	function selectdropdown0_value_binding(value) {
    		/*selectdropdown0_value_binding*/ ctx[28](value);
    	}

    	let selectdropdown0_props = {
    		menuItems: /*negativeEngraving*/ ctx[3]
    		? /*bookMenuItemsNeg*/ ctx[16]
    		: /*bookMenuItems*/ ctx[13],
    		width: "50px",
    		fontSize: "12px",
    		id: "0",
    		firstValueNull: "true",
    		disabled: /*addEngravingRow*/ ctx[2] || /*negativeEngraving*/ ctx[3]
    	};

    	if (/*engravingNodes*/ ctx[1][0] !== void 0) {
    		selectdropdown0_props.value = /*engravingNodes*/ ctx[1][0];
    	}

    	selectdropdown0 = new SelectDropdown({
    			props: selectdropdown0_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(selectdropdown0, 'value', selectdropdown0_value_binding));
    	selectdropdown0.$on("valueChange", /*valueChange*/ ctx[20]);

    	function selectdropdown1_value_binding(value) {
    		/*selectdropdown1_value_binding*/ ctx[29](value);
    	}

    	let selectdropdown1_props = {
    		menuItems: /*negativeEngraving*/ ctx[3]
    		? /*accessoryMenuItemsNeg*/ ctx[17]
    		: /*accessoryMenuItems*/ ctx[14],
    		width: "50px",
    		fontSize: "12px",
    		id: "1",
    		firstValueNull: "true",
    		disabled: /*addEngravingRow*/ ctx[2]
    	};

    	if (/*engravingNodes*/ ctx[1][1] !== void 0) {
    		selectdropdown1_props.value = /*engravingNodes*/ ctx[1][1];
    	}

    	selectdropdown1 = new SelectDropdown({
    			props: selectdropdown1_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(selectdropdown1, 'value', selectdropdown1_value_binding));
    	selectdropdown1.$on("valueChange", /*valueChange*/ ctx[20]);

    	function selectdropdown2_value_binding(value) {
    		/*selectdropdown2_value_binding*/ ctx[30](value);
    	}

    	let selectdropdown2_props = {
    		menuItems: /*negativeEngraving*/ ctx[3]
    		? /*accessoryMenuItemsNeg*/ ctx[17]
    		: /*accessoryMenuItems*/ ctx[14],
    		width: "50px",
    		fontSize: "12px",
    		id: "2",
    		firstValueNull: "true",
    		disabled: /*addEngravingRow*/ ctx[2]
    	};

    	if (/*engravingNodes*/ ctx[1][2] !== void 0) {
    		selectdropdown2_props.value = /*engravingNodes*/ ctx[1][2];
    	}

    	selectdropdown2 = new SelectDropdown({
    			props: selectdropdown2_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(selectdropdown2, 'value', selectdropdown2_value_binding));
    	selectdropdown2.$on("valueChange", /*valueChange*/ ctx[20]);

    	function selectdropdown3_value_binding(value) {
    		/*selectdropdown3_value_binding*/ ctx[31](value);
    	}

    	let selectdropdown3_props = {
    		menuItems: /*negativeEngraving*/ ctx[3]
    		? /*accessoryMenuItemsNeg*/ ctx[17]
    		: /*accessoryMenuItems*/ ctx[14],
    		width: "50px",
    		fontSize: "12px",
    		id: "3",
    		firstValueNull: "true",
    		disabled: /*addEngravingRow*/ ctx[2]
    	};

    	if (/*engravingNodes*/ ctx[1][3] !== void 0) {
    		selectdropdown3_props.value = /*engravingNodes*/ ctx[1][3];
    	}

    	selectdropdown3 = new SelectDropdown({
    			props: selectdropdown3_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(selectdropdown3, 'value', selectdropdown3_value_binding));
    	selectdropdown3.$on("valueChange", /*valueChange*/ ctx[20]);

    	function selectdropdown4_value_binding(value) {
    		/*selectdropdown4_value_binding*/ ctx[32](value);
    	}

    	let selectdropdown4_props = {
    		menuItems: /*negativeEngraving*/ ctx[3]
    		? /*accessoryMenuItemsNeg*/ ctx[17]
    		: /*accessoryMenuItems*/ ctx[14],
    		width: "50px",
    		fontSize: "12px",
    		id: "4",
    		firstValueNull: "true",
    		disabled: /*addEngravingRow*/ ctx[2]
    	};

    	if (/*engravingNodes*/ ctx[1][4] !== void 0) {
    		selectdropdown4_props.value = /*engravingNodes*/ ctx[1][4];
    	}

    	selectdropdown4 = new SelectDropdown({
    			props: selectdropdown4_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(selectdropdown4, 'value', selectdropdown4_value_binding));
    	selectdropdown4.$on("valueChange", /*valueChange*/ ctx[20]);

    	function selectdropdown5_value_binding(value) {
    		/*selectdropdown5_value_binding*/ ctx[33](value);
    	}

    	let selectdropdown5_props = {
    		menuItems: /*negativeEngraving*/ ctx[3]
    		? /*accessoryMenuItemsNeg*/ ctx[17]
    		: /*accessoryMenuItems*/ ctx[14],
    		width: "50px",
    		fontSize: "12px",
    		id: "5",
    		firstValueNull: "true",
    		disabled: /*addEngravingRow*/ ctx[2]
    	};

    	if (/*engravingNodes*/ ctx[1][5] !== void 0) {
    		selectdropdown5_props.value = /*engravingNodes*/ ctx[1][5];
    	}

    	selectdropdown5 = new SelectDropdown({
    			props: selectdropdown5_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(selectdropdown5, 'value', selectdropdown5_value_binding));
    	selectdropdown5.$on("valueChange", /*valueChange*/ ctx[20]);

    	function selectdropdown6_value_binding(value) {
    		/*selectdropdown6_value_binding*/ ctx[34](value);
    	}

    	let selectdropdown6_props = {
    		menuItems: /*negativeEngraving*/ ctx[3]
    		? /*stoneMenuItemsNeg*/ ctx[18]
    		: /*stoneMenuItems*/ ctx[15],
    		width: "50px",
    		fontSize: "12px",
    		id: "6",
    		firstValueNull: "true",
    		disabled: /*addEngravingRow*/ ctx[2]
    	};

    	if (/*engravingNodes*/ ctx[1][6] !== void 0) {
    		selectdropdown6_props.value = /*engravingNodes*/ ctx[1][6];
    	}

    	selectdropdown6 = new SelectDropdown({
    			props: selectdropdown6_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(selectdropdown6, 'value', selectdropdown6_value_binding));
    	selectdropdown6.$on("valueChange", /*valueChange*/ ctx[20]);
    	let if_block1 = !/*addEngravingRow*/ ctx[2] & !/*negativeEngraving*/ ctx[3] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			img = element("img");
    			t0 = space();
    			div0 = element("div");
    			create_component(filterdropdown.$$.fragment);
    			t1 = space();
    			td1 = element("td");

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].c();
    			}

    			t2 = space();
    			td2 = element("td");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t3 = space();
    			td3 = element("td");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t4 = space();
    			td4 = element("td");
    			h4 = element("h4");
    			if_block0.c();
    			t5 = space();
    			td5 = element("td");
    			div1 = element("div");
    			create_component(selectdropdown0.$$.fragment);
    			t6 = space();
    			td6 = element("td");
    			div2 = element("div");
    			create_component(selectdropdown1.$$.fragment);
    			t7 = space();
    			td7 = element("td");
    			div3 = element("div");
    			create_component(selectdropdown2.$$.fragment);
    			t8 = space();
    			td8 = element("td");
    			div4 = element("div");
    			create_component(selectdropdown3.$$.fragment);
    			t9 = space();
    			td9 = element("td");
    			div5 = element("div");
    			create_component(selectdropdown4.$$.fragment);
    			t10 = space();
    			td10 = element("td");
    			div6 = element("div");
    			create_component(selectdropdown5.$$.fragment);
    			t11 = space();
    			td11 = element("td");
    			div7 = element("div");
    			create_component(selectdropdown6.$$.fragment);
    			t12 = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    			if (!src_url_equal(img.src, img_src_value = /*engravingImgURL*/ ctx[6])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", /*engraving*/ ctx[0]);
    			attr_dev(img, "class", "engraving-img svelte-inzqfp");
    			toggle_class(img, "inactive-engraving", /*engravingNodesValue*/ ctx[7] < 5);
    			add_location(img, file$2, 176, 8, 6677);
    			attr_dev(div0, "class", "engraving-dropdown svelte-inzqfp");
    			add_location(div0, file$2, 177, 8, 6805);
    			attr_dev(td0, "class", "engraving-selection svelte-inzqfp");
    			add_location(td0, file$2, 175, 4, 6635);
    			attr_dev(td1, "class", "engraving-nodes nodes-level1 svelte-inzqfp");
    			add_location(td1, file$2, 179, 4, 7097);
    			attr_dev(td2, "class", "engraving-nodes nodes-level2 svelte-inzqfp");
    			add_location(td2, file$2, 192, 4, 7629);
    			attr_dev(td3, "class", "engraving-nodes nodes-level3 svelte-inzqfp");
    			add_location(td3, file$2, 205, 4, 8166);
    			attr_dev(h4, "class", "svelte-inzqfp");
    			toggle_class(h4, "extra-nodes", /*engravingNodesValue*/ ctx[7] > 15);
    			add_location(h4, file$2, 219, 8, 8748);
    			attr_dev(td4, "class", "engraving-nodes-extra svelte-inzqfp");
    			add_location(td4, file$2, 218, 4, 8704);
    			attr_dev(div1, "class", "equipment-bonus-dropdown svelte-inzqfp");
    			add_location(div1, file$2, 228, 8, 9022);
    			attr_dev(td5, "class", "equipment-bonuses book svelte-inzqfp");
    			add_location(td5, file$2, 227, 4, 8977);
    			attr_dev(div2, "class", "equipment-bonus-dropdown svelte-inzqfp");
    			add_location(div2, file$2, 233, 8, 9400);
    			attr_dev(td6, "class", "equipment-bonuses necklace svelte-inzqfp");
    			add_location(td6, file$2, 232, 4, 9351);
    			attr_dev(div3, "class", "equipment-bonus-dropdown svelte-inzqfp");
    			add_location(div3, file$2, 238, 8, 9766);
    			attr_dev(td7, "class", "equipment-bonuses earring svelte-inzqfp");
    			add_location(td7, file$2, 237, 4, 9718);
    			attr_dev(div4, "class", "equipment-bonus-dropdown svelte-inzqfp");
    			add_location(div4, file$2, 243, 8, 10132);
    			attr_dev(td8, "class", "equipment-bonuses earring svelte-inzqfp");
    			add_location(td8, file$2, 242, 4, 10084);
    			attr_dev(div5, "class", "equipment-bonus-dropdown svelte-inzqfp");
    			add_location(div5, file$2, 248, 8, 10495);
    			attr_dev(td9, "class", "equipment-bonuses ring svelte-inzqfp");
    			add_location(td9, file$2, 247, 4, 10450);
    			attr_dev(div6, "class", "equipment-bonus-dropdown svelte-inzqfp");
    			add_location(div6, file$2, 253, 8, 10858);
    			attr_dev(td10, "class", "equipment-bonuses ring svelte-inzqfp");
    			add_location(td10, file$2, 252, 4, 10813);
    			attr_dev(div7, "class", "equipment-bonus-dropdown svelte-inzqfp");
    			add_location(div7, file$2, 258, 8, 11222);
    			attr_dev(td11, "class", "equipment-bonuses stone svelte-inzqfp");
    			add_location(td11, file$2, 257, 4, 11176);
    			attr_dev(tr, "class", "row-container svelte-inzqfp");
    			toggle_class(tr, "in-transition", /*inTransition*/ ctx[11]);
    			toggle_class(tr, "error", /*error*/ ctx[12]);
    			add_location(tr, file$2, 174, 0, 6337);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			append_dev(td0, img);
    			append_dev(td0, t0);
    			append_dev(td0, div0);
    			mount_component(filterdropdown, div0, null);
    			append_dev(tr, t1);
    			append_dev(tr, td1);

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].m(td1, null);
    			}

    			append_dev(tr, t2);
    			append_dev(tr, td2);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(td2, null);
    			}

    			append_dev(tr, t3);
    			append_dev(tr, td3);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(td3, null);
    			}

    			append_dev(tr, t4);
    			append_dev(tr, td4);
    			append_dev(td4, h4);
    			if_block0.m(h4, null);
    			append_dev(tr, t5);
    			append_dev(tr, td5);
    			append_dev(td5, div1);
    			mount_component(selectdropdown0, div1, null);
    			append_dev(tr, t6);
    			append_dev(tr, td6);
    			append_dev(td6, div2);
    			mount_component(selectdropdown1, div2, null);
    			append_dev(tr, t7);
    			append_dev(tr, td7);
    			append_dev(td7, div3);
    			mount_component(selectdropdown2, div3, null);
    			append_dev(tr, t8);
    			append_dev(tr, td8);
    			append_dev(td8, div4);
    			mount_component(selectdropdown3, div4, null);
    			append_dev(tr, t9);
    			append_dev(tr, td9);
    			append_dev(td9, div5);
    			mount_component(selectdropdown4, div5, null);
    			append_dev(tr, t10);
    			append_dev(tr, td10);
    			append_dev(td10, div6);
    			mount_component(selectdropdown5, div6, null);
    			append_dev(tr, t11);
    			append_dev(tr, td11);
    			append_dev(td11, div7);
    			mount_component(selectdropdown6, div7, null);
    			insert_dev(target, t12, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(tr, "introstart", /*introstart_handler*/ ctx[35], false, false, false),
    					listen_dev(tr, "introend", /*introend_handler*/ ctx[36], false, false, false),
    					listen_dev(tr, "outrostart", /*outrostart_handler*/ ctx[37], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty[0] & /*engravingImgURL*/ 64 && !src_url_equal(img.src, img_src_value = /*engravingImgURL*/ ctx[6])) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (!current || dirty[0] & /*engraving*/ 1) {
    				attr_dev(img, "alt", /*engraving*/ ctx[0]);
    			}

    			if (dirty[0] & /*engravingNodesValue*/ 128) {
    				toggle_class(img, "inactive-engraving", /*engravingNodesValue*/ ctx[7] < 5);
    			}

    			const filterdropdown_changes = {};
    			if (dirty[0] & /*engravingMenuItems*/ 32) filterdropdown_changes.menuItems = /*engravingMenuItems*/ ctx[5];
    			if (dirty[0] & /*negativeEngraving*/ 8) filterdropdown_changes.disabled = /*negativeEngraving*/ ctx[3];

    			if (!updating_inputValue && dirty[0] & /*engravingInput*/ 16) {
    				updating_inputValue = true;
    				filterdropdown_changes.inputValue = /*engravingInput*/ ctx[4];
    				add_flush_callback(() => updating_inputValue = false);
    			}

    			filterdropdown.$set(filterdropdown_changes);

    			if (dirty[0] & /*activeNodeSRC, engravingNodesValue, filledNodeSRC, emptyNodeSRC*/ 1920) {
    				each_value_2 = { length: 5 };
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks_2[i]) {
    						each_blocks_2[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_2[i] = create_each_block_2(child_ctx);
    						each_blocks_2[i].c();
    						each_blocks_2[i].m(td1, null);
    					}
    				}

    				for (; i < each_blocks_2.length; i += 1) {
    					each_blocks_2[i].d(1);
    				}

    				each_blocks_2.length = each_value_2.length;
    			}

    			if (dirty[0] & /*activeNodeSRC, engravingNodesValue, filledNodeSRC, emptyNodeSRC*/ 1920) {
    				each_value_1 = { length: 5 };
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1$1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(td2, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty[0] & /*activeNodeSRC, engravingNodesValue, filledNodeSRC, emptyNodeSRC*/ 1920) {
    				each_value = { length: 5 };
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(td3, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (current_block_type === (current_block_type = select_block_type_6(ctx)) && if_block0) {
    				if_block0.p(ctx, dirty);
    			} else {
    				if_block0.d(1);
    				if_block0 = current_block_type(ctx);

    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(h4, null);
    				}
    			}

    			if (dirty[0] & /*engravingNodesValue*/ 128) {
    				toggle_class(h4, "extra-nodes", /*engravingNodesValue*/ ctx[7] > 15);
    			}

    			const selectdropdown0_changes = {};

    			if (dirty[0] & /*negativeEngraving*/ 8) selectdropdown0_changes.menuItems = /*negativeEngraving*/ ctx[3]
    			? /*bookMenuItemsNeg*/ ctx[16]
    			: /*bookMenuItems*/ ctx[13];

    			if (dirty[0] & /*addEngravingRow, negativeEngraving*/ 12) selectdropdown0_changes.disabled = /*addEngravingRow*/ ctx[2] || /*negativeEngraving*/ ctx[3];

    			if (!updating_value && dirty[0] & /*engravingNodes*/ 2) {
    				updating_value = true;
    				selectdropdown0_changes.value = /*engravingNodes*/ ctx[1][0];
    				add_flush_callback(() => updating_value = false);
    			}

    			selectdropdown0.$set(selectdropdown0_changes);
    			const selectdropdown1_changes = {};

    			if (dirty[0] & /*negativeEngraving*/ 8) selectdropdown1_changes.menuItems = /*negativeEngraving*/ ctx[3]
    			? /*accessoryMenuItemsNeg*/ ctx[17]
    			: /*accessoryMenuItems*/ ctx[14];

    			if (dirty[0] & /*addEngravingRow*/ 4) selectdropdown1_changes.disabled = /*addEngravingRow*/ ctx[2];

    			if (!updating_value_1 && dirty[0] & /*engravingNodes*/ 2) {
    				updating_value_1 = true;
    				selectdropdown1_changes.value = /*engravingNodes*/ ctx[1][1];
    				add_flush_callback(() => updating_value_1 = false);
    			}

    			selectdropdown1.$set(selectdropdown1_changes);
    			const selectdropdown2_changes = {};

    			if (dirty[0] & /*negativeEngraving*/ 8) selectdropdown2_changes.menuItems = /*negativeEngraving*/ ctx[3]
    			? /*accessoryMenuItemsNeg*/ ctx[17]
    			: /*accessoryMenuItems*/ ctx[14];

    			if (dirty[0] & /*addEngravingRow*/ 4) selectdropdown2_changes.disabled = /*addEngravingRow*/ ctx[2];

    			if (!updating_value_2 && dirty[0] & /*engravingNodes*/ 2) {
    				updating_value_2 = true;
    				selectdropdown2_changes.value = /*engravingNodes*/ ctx[1][2];
    				add_flush_callback(() => updating_value_2 = false);
    			}

    			selectdropdown2.$set(selectdropdown2_changes);
    			const selectdropdown3_changes = {};

    			if (dirty[0] & /*negativeEngraving*/ 8) selectdropdown3_changes.menuItems = /*negativeEngraving*/ ctx[3]
    			? /*accessoryMenuItemsNeg*/ ctx[17]
    			: /*accessoryMenuItems*/ ctx[14];

    			if (dirty[0] & /*addEngravingRow*/ 4) selectdropdown3_changes.disabled = /*addEngravingRow*/ ctx[2];

    			if (!updating_value_3 && dirty[0] & /*engravingNodes*/ 2) {
    				updating_value_3 = true;
    				selectdropdown3_changes.value = /*engravingNodes*/ ctx[1][3];
    				add_flush_callback(() => updating_value_3 = false);
    			}

    			selectdropdown3.$set(selectdropdown3_changes);
    			const selectdropdown4_changes = {};

    			if (dirty[0] & /*negativeEngraving*/ 8) selectdropdown4_changes.menuItems = /*negativeEngraving*/ ctx[3]
    			? /*accessoryMenuItemsNeg*/ ctx[17]
    			: /*accessoryMenuItems*/ ctx[14];

    			if (dirty[0] & /*addEngravingRow*/ 4) selectdropdown4_changes.disabled = /*addEngravingRow*/ ctx[2];

    			if (!updating_value_4 && dirty[0] & /*engravingNodes*/ 2) {
    				updating_value_4 = true;
    				selectdropdown4_changes.value = /*engravingNodes*/ ctx[1][4];
    				add_flush_callback(() => updating_value_4 = false);
    			}

    			selectdropdown4.$set(selectdropdown4_changes);
    			const selectdropdown5_changes = {};

    			if (dirty[0] & /*negativeEngraving*/ 8) selectdropdown5_changes.menuItems = /*negativeEngraving*/ ctx[3]
    			? /*accessoryMenuItemsNeg*/ ctx[17]
    			: /*accessoryMenuItems*/ ctx[14];

    			if (dirty[0] & /*addEngravingRow*/ 4) selectdropdown5_changes.disabled = /*addEngravingRow*/ ctx[2];

    			if (!updating_value_5 && dirty[0] & /*engravingNodes*/ 2) {
    				updating_value_5 = true;
    				selectdropdown5_changes.value = /*engravingNodes*/ ctx[1][5];
    				add_flush_callback(() => updating_value_5 = false);
    			}

    			selectdropdown5.$set(selectdropdown5_changes);
    			const selectdropdown6_changes = {};

    			if (dirty[0] & /*negativeEngraving*/ 8) selectdropdown6_changes.menuItems = /*negativeEngraving*/ ctx[3]
    			? /*stoneMenuItemsNeg*/ ctx[18]
    			: /*stoneMenuItems*/ ctx[15];

    			if (dirty[0] & /*addEngravingRow*/ 4) selectdropdown6_changes.disabled = /*addEngravingRow*/ ctx[2];

    			if (!updating_value_6 && dirty[0] & /*engravingNodes*/ 2) {
    				updating_value_6 = true;
    				selectdropdown6_changes.value = /*engravingNodes*/ ctx[1][6];
    				add_flush_callback(() => updating_value_6 = false);
    			}

    			selectdropdown6.$set(selectdropdown6_changes);

    			if (dirty[0] & /*inTransition*/ 2048) {
    				toggle_class(tr, "in-transition", /*inTransition*/ ctx[11]);
    			}

    			if (dirty[0] & /*error*/ 4096) {
    				toggle_class(tr, "error", /*error*/ ctx[12]);
    			}

    			if (!/*addEngravingRow*/ ctx[2] & !/*negativeEngraving*/ ctx[3]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty[0] & /*addEngravingRow, negativeEngraving*/ 12) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block$1(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(filterdropdown.$$.fragment, local);
    			transition_in(selectdropdown0.$$.fragment, local);
    			transition_in(selectdropdown1.$$.fragment, local);
    			transition_in(selectdropdown2.$$.fragment, local);
    			transition_in(selectdropdown3.$$.fragment, local);
    			transition_in(selectdropdown4.$$.fragment, local);
    			transition_in(selectdropdown5.$$.fragment, local);
    			transition_in(selectdropdown6.$$.fragment, local);

    			if (local) {
    				add_render_callback(() => {
    					if (tr_outro) tr_outro.end(1);
    					tr_intro = create_in_transition(tr, fly, { y: 40, duration: 1000 });
    					tr_intro.start();
    				});
    			}

    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(filterdropdown.$$.fragment, local);
    			transition_out(selectdropdown0.$$.fragment, local);
    			transition_out(selectdropdown1.$$.fragment, local);
    			transition_out(selectdropdown2.$$.fragment, local);
    			transition_out(selectdropdown3.$$.fragment, local);
    			transition_out(selectdropdown4.$$.fragment, local);
    			transition_out(selectdropdown5.$$.fragment, local);
    			transition_out(selectdropdown6.$$.fragment, local);
    			if (tr_intro) tr_intro.invalidate();

    			if (local) {
    				tr_outro = create_out_transition(tr, fly, { x: 50, duration: 500 });
    			}

    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			destroy_component(filterdropdown);
    			destroy_each(each_blocks_2, detaching);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    			if_block0.d();
    			destroy_component(selectdropdown0);
    			destroy_component(selectdropdown1);
    			destroy_component(selectdropdown2);
    			destroy_component(selectdropdown3);
    			destroy_component(selectdropdown4);
    			destroy_component(selectdropdown5);
    			destroy_component(selectdropdown6);
    			if (detaching && tr_outro) tr_outro.end();
    			if (detaching) detach_dev(t12);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let $CombatEngravingStore;
    	let $SelectedEngravings;
    	let $NegativeEngravings;
    	let $SelectedClass;
    	let $ClassEngravingStore;
    	validate_store(CombatEngravingStore, 'CombatEngravingStore');
    	component_subscribe($$self, CombatEngravingStore, $$value => $$invalidate(24, $CombatEngravingStore = $$value));
    	validate_store(SelectedEngravings, 'SelectedEngravings');
    	component_subscribe($$self, SelectedEngravings, $$value => $$invalidate(38, $SelectedEngravings = $$value));
    	validate_store(NegativeEngravings, 'NegativeEngravings');
    	component_subscribe($$self, NegativeEngravings, $$value => $$invalidate(39, $NegativeEngravings = $$value));
    	validate_store(SelectedClass, 'SelectedClass');
    	component_subscribe($$self, SelectedClass, $$value => $$invalidate(25, $SelectedClass = $$value));
    	validate_store(ClassEngravingStore, 'ClassEngravingStore');
    	component_subscribe($$self, ClassEngravingStore, $$value => $$invalidate(26, $ClassEngravingStore = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Engraving_row', slots, []);
    	let { engraving = '' } = $$props;
    	let engravingInput = engraving;
    	let { id = -1 } = $$props;
    	let { addEngravingRow = false } = $$props;
    	let { negativeEngraving = false } = $$props;
    	let engravingMenuItems = [];
    	let engravingImgURL = '';
    	let engravingNodesValue = 0;
    	let { engravingNodes = ['-', '-', '-', '-', '-', '-', '-'] } = $$props;
    	let bookMenuItems = ['-', '+3', '+6', '+9', '+12', '+18'];
    	let accessoryMenuItems = ['-', '+1', '+2', '+3', '+4', '+5', '+6'];
    	let stoneMenuItems = ['-', '+1', '+2', '+3', '+4', '+5', '+6', '+7', '+8', '+9', '+10'];
    	let bookMenuItemsNeg = ['-'];
    	let accessoryMenuItemsNeg = ['-', '+1', '+2', '+3'];
    	let stoneMenuItemsNeg = ['-', '+1', '+2', '+3', '+4', '+5', '+6', '+7', '+8', '+9', '+10'];

    	let nodeSrcURLs = [
    		"./images/nodes/node_active.svg",
    		"./images/nodes/node_active_filled.svg",
    		"./images/nodes/node_active_empty.svg",
    		"./images/nodes/node_active_neg.svg",
    		"./images/nodes/node_inactive_filled.svg",
    		"./images/nodes/node_inactive_empty.svg"
    	];

    	let activeNodeSRC = nodeSrcURLs[0];
    	let filledNodeSRC = nodeSrcURLs[1];
    	let emptyNodeSRC = nodeSrcURLs[2];
    	let inTransition = false;
    	let error = false;

    	onMount(() => {
    		if (addEngravingRow) {
    			preloadImages();
    		}

    		updateEngravingIcon();
    		updateNodes();

    		if (negativeEngraving || addEngravingRow) {
    			$$invalidate(8, activeNodeSRC = nodeSrcURLs[3]);
    			$$invalidate(9, filledNodeSRC = nodeSrcURLs[4]);
    			$$invalidate(10, emptyNodeSRC = nodeSrcURLs[5]);
    		}
    	});

    	const engravingChange = e => {
    		//if adding engraving
    		if (addEngravingRow) {
    			SelectedEngravings.update(current => {
    				let copiedEngravings = [...current];

    				//if engraving already exists
    				if (copiedEngravings.find(engravings => engravings.engraving === e.detail.item)) {
    					$$invalidate(12, error = true);

    					setTimeout(
    						() => {
    							$$invalidate(12, error = false);
    						},
    						1000
    					);

    					return copiedEngravings;
    				}

    				//add new engraving
    				let newEngraving = {
    					id: Date.now(),
    					engraving: e.detail.item,
    					nodes: ['-', '-', '-', '-', '-', '-', '-']
    				};

    				copiedEngravings = [...current, newEngraving];
    				return copiedEngravings;
    			});
    		} else {
    			//else changing current engraving
    			SelectedEngravings.update(current => {
    				let copiedEngravings = [...current];

    				//if engraving already exists
    				if (copiedEngravings.find(engraving => engraving.engraving === e.detail.item)) {
    					$$invalidate(12, error = true);

    					setTimeout(
    						() => {
    							$$invalidate(12, error = false);
    						},
    						1000
    					);

    					return copiedEngravings;
    				}

    				$$invalidate(0, engraving = e.detail.item);
    				let updatedEngraving = copiedEngravings.find(engraving => engraving.id === id);
    				updatedEngraving.engraving = engraving;
    				updateEngravingIcon();
    				return copiedEngravings;
    			});
    		}
    	};

    	const updateEngravingIcon = () => {
    		let engravingName;

    		if (addEngravingRow) {
    			engravingName = 'noengraving';
    		} else {
    			engravingName = engraving;
    		}

    		$$invalidate(6, engravingImgURL = getEngravingURL(engravingName));
    	};

    	const getEngravingURL = name => {
    		let regex = /[^a-zA-Z]/g;
    		name = name.replaceAll(regex, '').toLowerCase();
    		return "./images/engravings/" + name + ".png";
    	};

    	const valueChange = e => {
    		let nodeId = e.detail.id;
    		let newValue = e.detail.item;
    		let updatedEngraving;

    		if (negativeEngraving) {
    			updatedEngraving = $NegativeEngravings.find(engraving => engraving.id === id);
    			console.log($NegativeEngravings);
    		} else {
    			updatedEngraving = $SelectedEngravings.find(engraving => engraving.id === id);
    			console.log($SelectedEngravings);
    		}

    		let copiedEngravingNodes = updatedEngraving.nodes;
    		copiedEngravingNodes[nodeId] = newValue;
    		updateNodes();
    	};

    	const updateNodes = () => {
    		$$invalidate(7, engravingNodesValue = 0);

    		engravingNodes.forEach(element => {
    			if (element != "-") {
    				$$invalidate(7, engravingNodesValue += parseInt(element));
    			}
    		});
    	};

    	const engravingDropdownBlur = () => {
    		if (engraving != '') {
    			$$invalidate(4, engravingInput = engraving);
    		}
    	};

    	const handleDelete = () => {
    		SelectedEngravings.update(current => {
    			let copiedEngravings = [...current];
    			return copiedEngravings.filter(engraving => engraving.id != id);
    		});
    	};

    	const preloadImages = () => {
    		$CombatEngravingStore.forEach(engraving => {
    			var img = new Image();
    			img.src = getEngravingURL(engraving);
    		});

    		nodeSrcURLs.forEach(url => {
    			var img = new Image();
    			img.src = url;
    		});
    	};

    	const writable_props = ['engraving', 'id', 'addEngravingRow', 'negativeEngraving', 'engravingNodes'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$1.warn(`<Engraving_row> was created with unknown prop '${key}'`);
    	});

    	function filterdropdown_inputValue_binding(value) {
    		engravingInput = value;
    		$$invalidate(4, engravingInput);
    	}

    	function selectdropdown0_value_binding(value) {
    		if ($$self.$$.not_equal(engravingNodes[0], value)) {
    			engravingNodes[0] = value;
    			$$invalidate(1, engravingNodes);
    		}
    	}

    	function selectdropdown1_value_binding(value) {
    		if ($$self.$$.not_equal(engravingNodes[1], value)) {
    			engravingNodes[1] = value;
    			$$invalidate(1, engravingNodes);
    		}
    	}

    	function selectdropdown2_value_binding(value) {
    		if ($$self.$$.not_equal(engravingNodes[2], value)) {
    			engravingNodes[2] = value;
    			$$invalidate(1, engravingNodes);
    		}
    	}

    	function selectdropdown3_value_binding(value) {
    		if ($$self.$$.not_equal(engravingNodes[3], value)) {
    			engravingNodes[3] = value;
    			$$invalidate(1, engravingNodes);
    		}
    	}

    	function selectdropdown4_value_binding(value) {
    		if ($$self.$$.not_equal(engravingNodes[4], value)) {
    			engravingNodes[4] = value;
    			$$invalidate(1, engravingNodes);
    		}
    	}

    	function selectdropdown5_value_binding(value) {
    		if ($$self.$$.not_equal(engravingNodes[5], value)) {
    			engravingNodes[5] = value;
    			$$invalidate(1, engravingNodes);
    		}
    	}

    	function selectdropdown6_value_binding(value) {
    		if ($$self.$$.not_equal(engravingNodes[6], value)) {
    			engravingNodes[6] = value;
    			$$invalidate(1, engravingNodes);
    		}
    	}

    	const introstart_handler = () => $$invalidate(11, inTransition = true);
    	const introend_handler = () => $$invalidate(11, inTransition = false);
    	const outrostart_handler = () => $$invalidate(11, inTransition = true);

    	$$self.$$set = $$props => {
    		if ('engraving' in $$props) $$invalidate(0, engraving = $$props.engraving);
    		if ('id' in $$props) $$invalidate(23, id = $$props.id);
    		if ('addEngravingRow' in $$props) $$invalidate(2, addEngravingRow = $$props.addEngravingRow);
    		if ('negativeEngraving' in $$props) $$invalidate(3, negativeEngraving = $$props.negativeEngraving);
    		if ('engravingNodes' in $$props) $$invalidate(1, engravingNodes = $$props.engravingNodes);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		onDestroy,
    		FilterDropdown,
    		SelectDropdown,
    		SelectedClass,
    		SelectedEngravings,
    		NegativeEngravings,
    		CombatEngravingStore,
    		ClassEngravingStore,
    		fade,
    		fly,
    		slide,
    		engraving,
    		engravingInput,
    		id,
    		addEngravingRow,
    		negativeEngraving,
    		engravingMenuItems,
    		engravingImgURL,
    		engravingNodesValue,
    		engravingNodes,
    		bookMenuItems,
    		accessoryMenuItems,
    		stoneMenuItems,
    		bookMenuItemsNeg,
    		accessoryMenuItemsNeg,
    		stoneMenuItemsNeg,
    		nodeSrcURLs,
    		activeNodeSRC,
    		filledNodeSRC,
    		emptyNodeSRC,
    		inTransition,
    		error,
    		engravingChange,
    		updateEngravingIcon,
    		getEngravingURL,
    		valueChange,
    		updateNodes,
    		engravingDropdownBlur,
    		handleDelete,
    		preloadImages,
    		$CombatEngravingStore,
    		$SelectedEngravings,
    		$NegativeEngravings,
    		$SelectedClass,
    		$ClassEngravingStore
    	});

    	$$self.$inject_state = $$props => {
    		if ('engraving' in $$props) $$invalidate(0, engraving = $$props.engraving);
    		if ('engravingInput' in $$props) $$invalidate(4, engravingInput = $$props.engravingInput);
    		if ('id' in $$props) $$invalidate(23, id = $$props.id);
    		if ('addEngravingRow' in $$props) $$invalidate(2, addEngravingRow = $$props.addEngravingRow);
    		if ('negativeEngraving' in $$props) $$invalidate(3, negativeEngraving = $$props.negativeEngraving);
    		if ('engravingMenuItems' in $$props) $$invalidate(5, engravingMenuItems = $$props.engravingMenuItems);
    		if ('engravingImgURL' in $$props) $$invalidate(6, engravingImgURL = $$props.engravingImgURL);
    		if ('engravingNodesValue' in $$props) $$invalidate(7, engravingNodesValue = $$props.engravingNodesValue);
    		if ('engravingNodes' in $$props) $$invalidate(1, engravingNodes = $$props.engravingNodes);
    		if ('bookMenuItems' in $$props) $$invalidate(13, bookMenuItems = $$props.bookMenuItems);
    		if ('accessoryMenuItems' in $$props) $$invalidate(14, accessoryMenuItems = $$props.accessoryMenuItems);
    		if ('stoneMenuItems' in $$props) $$invalidate(15, stoneMenuItems = $$props.stoneMenuItems);
    		if ('bookMenuItemsNeg' in $$props) $$invalidate(16, bookMenuItemsNeg = $$props.bookMenuItemsNeg);
    		if ('accessoryMenuItemsNeg' in $$props) $$invalidate(17, accessoryMenuItemsNeg = $$props.accessoryMenuItemsNeg);
    		if ('stoneMenuItemsNeg' in $$props) $$invalidate(18, stoneMenuItemsNeg = $$props.stoneMenuItemsNeg);
    		if ('nodeSrcURLs' in $$props) nodeSrcURLs = $$props.nodeSrcURLs;
    		if ('activeNodeSRC' in $$props) $$invalidate(8, activeNodeSRC = $$props.activeNodeSRC);
    		if ('filledNodeSRC' in $$props) $$invalidate(9, filledNodeSRC = $$props.filledNodeSRC);
    		if ('emptyNodeSRC' in $$props) $$invalidate(10, emptyNodeSRC = $$props.emptyNodeSRC);
    		if ('inTransition' in $$props) $$invalidate(11, inTransition = $$props.inTransition);
    		if ('error' in $$props) $$invalidate(12, error = $$props.error);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*negativeEngraving, $CombatEngravingStore, $SelectedClass, $ClassEngravingStore*/ 117440520) {
    			{
    				if (!negativeEngraving) {
    					$$invalidate(5, engravingMenuItems = $CombatEngravingStore);

    					if ($SelectedClass != '') {
    						let classEngravings = $ClassEngravingStore.find(advClass => advClass.name === $SelectedClass).engravings;
    						$$invalidate(5, engravingMenuItems = [...classEngravings, ...$CombatEngravingStore]);
    					}
    				}
    			}
    		}
    	};

    	return [
    		engraving,
    		engravingNodes,
    		addEngravingRow,
    		negativeEngraving,
    		engravingInput,
    		engravingMenuItems,
    		engravingImgURL,
    		engravingNodesValue,
    		activeNodeSRC,
    		filledNodeSRC,
    		emptyNodeSRC,
    		inTransition,
    		error,
    		bookMenuItems,
    		accessoryMenuItems,
    		stoneMenuItems,
    		bookMenuItemsNeg,
    		accessoryMenuItemsNeg,
    		stoneMenuItemsNeg,
    		engravingChange,
    		valueChange,
    		engravingDropdownBlur,
    		handleDelete,
    		id,
    		$CombatEngravingStore,
    		$SelectedClass,
    		$ClassEngravingStore,
    		filterdropdown_inputValue_binding,
    		selectdropdown0_value_binding,
    		selectdropdown1_value_binding,
    		selectdropdown2_value_binding,
    		selectdropdown3_value_binding,
    		selectdropdown4_value_binding,
    		selectdropdown5_value_binding,
    		selectdropdown6_value_binding,
    		introstart_handler,
    		introend_handler,
    		outrostart_handler
    	];
    }

    class Engraving_row extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$2,
    			create_fragment$2,
    			safe_not_equal,
    			{
    				engraving: 0,
    				id: 23,
    				addEngravingRow: 2,
    				negativeEngraving: 3,
    				engravingNodes: 1
    			},
    			null,
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Engraving_row",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get engraving() {
    		throw new Error("<Engraving_row>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set engraving(value) {
    		throw new Error("<Engraving_row>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get id() {
    		throw new Error("<Engraving_row>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<Engraving_row>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get addEngravingRow() {
    		throw new Error("<Engraving_row>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set addEngravingRow(value) {
    		throw new Error("<Engraving_row>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get negativeEngraving() {
    		throw new Error("<Engraving_row>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set negativeEngraving(value) {
    		throw new Error("<Engraving_row>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get engravingNodes() {
    		throw new Error("<Engraving_row>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set engravingNodes(value) {
    		throw new Error("<Engraving_row>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\engraving-organizer.svelte generated by Svelte v3.49.0 */

    const { console: console_1 } = globals;
    const file$1 = "src\\components\\engraving-organizer.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	return child_ctx;
    }

    // (21:4) {#if advClass != ""}
    function create_if_block(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = /*classIconURL*/ ctx[1])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Class Icon");
    			attr_dev(img, "class", "class-icon svelte-1799ozp");
    			add_location(img, file$1, 21, 8, 752);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*classIconURL*/ 2 && !src_url_equal(img.src, img_src_value = /*classIconURL*/ ctx[1])) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(21:4) {#if advClass != \\\"\\\"}",
    		ctx
    	});

    	return block;
    }

    // (65:4) {#each $SelectedEngravings as engravingRow (engravingRow.id)}
    function create_each_block_1(key_1, ctx) {
    	let first;
    	let engravingrow;
    	let current;

    	engravingrow = new Engraving_row({
    			props: {
    				engraving: /*engravingRow*/ ctx[5].engraving,
    				id: /*engravingRow*/ ctx[5].id,
    				engravingNodes: /*engravingRow*/ ctx[5].nodes
    			},
    			$$inline: true
    		});

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			create_component(engravingrow.$$.fragment);
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);
    			mount_component(engravingrow, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const engravingrow_changes = {};
    			if (dirty & /*$SelectedEngravings*/ 4) engravingrow_changes.engraving = /*engravingRow*/ ctx[5].engraving;
    			if (dirty & /*$SelectedEngravings*/ 4) engravingrow_changes.id = /*engravingRow*/ ctx[5].id;
    			if (dirty & /*$SelectedEngravings*/ 4) engravingrow_changes.engravingNodes = /*engravingRow*/ ctx[5].nodes;
    			engravingrow.$set(engravingrow_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(engravingrow.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(engravingrow.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			destroy_component(engravingrow, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(65:4) {#each $SelectedEngravings as engravingRow (engravingRow.id)}",
    		ctx
    	});

    	return block;
    }

    // (84:4) {#each $NegativeEngravings as engravingRow (engravingRow.id)}
    function create_each_block(key_1, ctx) {
    	let first;
    	let engravingrow;
    	let current;

    	engravingrow = new Engraving_row({
    			props: {
    				engraving: /*engravingRow*/ ctx[5].engraving,
    				id: /*engravingRow*/ ctx[5].id,
    				engravingNodes: /*engravingRow*/ ctx[5].nodes,
    				negativeEngraving: "true"
    			},
    			$$inline: true
    		});

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			create_component(engravingrow.$$.fragment);
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);
    			mount_component(engravingrow, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const engravingrow_changes = {};
    			if (dirty & /*$NegativeEngravings*/ 8) engravingrow_changes.engraving = /*engravingRow*/ ctx[5].engraving;
    			if (dirty & /*$NegativeEngravings*/ 8) engravingrow_changes.id = /*engravingRow*/ ctx[5].id;
    			if (dirty & /*$NegativeEngravings*/ 8) engravingrow_changes.engravingNodes = /*engravingRow*/ ctx[5].nodes;
    			engravingrow.$set(engravingrow_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(engravingrow.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(engravingrow.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			destroy_component(engravingrow, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(84:4) {#each $NegativeEngravings as engravingRow (engravingRow.id)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div2;
    	let div0;
    	let t0;
    	let div1;
    	let classdropdown;
    	let t1;
    	let table;
    	let tr0;
    	let th0;
    	let h30;
    	let t3;
    	let th1;
    	let h31;
    	let t5;
    	let th2;
    	let h32;
    	let t7;
    	let th3;
    	let h33;
    	let t9;
    	let th4;
    	let h34;
    	let t11;
    	let th5;
    	let img0;
    	let img0_src_value;
    	let t12;
    	let img1;
    	let img1_src_value;
    	let t13;
    	let th6;
    	let img2;
    	let img2_src_value;
    	let t14;
    	let img3;
    	let img3_src_value;
    	let t15;
    	let th7;
    	let img4;
    	let img4_src_value;
    	let t16;
    	let img5;
    	let img5_src_value;
    	let t17;
    	let th8;
    	let img6;
    	let img6_src_value;
    	let t18;
    	let img7;
    	let img7_src_value;
    	let t19;
    	let th9;
    	let img8;
    	let img8_src_value;
    	let t20;
    	let img9;
    	let img9_src_value;
    	let t21;
    	let th10;
    	let img10;
    	let img10_src_value;
    	let t22;
    	let img11;
    	let img11_src_value;
    	let t23;
    	let th11;
    	let img12;
    	let img12_src_value;
    	let t24;
    	let img13;
    	let img13_src_value;
    	let t25;
    	let each_blocks_1 = [];
    	let each0_lookup = new Map();
    	let t26;
    	let engravingrow;
    	let t27;
    	let tr1;
    	let th12;
    	let h35;
    	let t29;
    	let th13;
    	let h36;
    	let t31;
    	let th14;
    	let h37;
    	let t33;
    	let th15;
    	let h38;
    	let t35;
    	let th16;
    	let h39;
    	let t37;
    	let th17;
    	let t38;
    	let th18;
    	let t39;
    	let th19;
    	let t40;
    	let th20;
    	let t41;
    	let th21;
    	let t42;
    	let th22;
    	let t43;
    	let th23;
    	let t44;
    	let each_blocks = [];
    	let each1_lookup = new Map();
    	let current;
    	let if_block = /*advClass*/ ctx[0] != "" && create_if_block(ctx);
    	classdropdown = new ClassDropdown({ $$inline: true });
    	classdropdown.$on("valueChange", /*classChange*/ ctx[4]);
    	let each_value_1 = /*$SelectedEngravings*/ ctx[2];
    	validate_each_argument(each_value_1);
    	const get_key = ctx => /*engravingRow*/ ctx[5].id;
    	validate_each_keys(ctx, each_value_1, get_each_context_1, get_key);

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		let child_ctx = get_each_context_1(ctx, each_value_1, i);
    		let key = get_key(child_ctx);
    		each0_lookup.set(key, each_blocks_1[i] = create_each_block_1(key, child_ctx));
    	}

    	engravingrow = new Engraving_row({
    			props: { addEngravingRow: true },
    			$$inline: true
    		});

    	let each_value = /*$NegativeEngravings*/ ctx[3];
    	validate_each_argument(each_value);
    	const get_key_1 = ctx => /*engravingRow*/ ctx[5].id;
    	validate_each_keys(ctx, each_value, get_each_context, get_key_1);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context(ctx, each_value, i);
    		let key = get_key_1(child_ctx);
    		each1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			if (if_block) if_block.c();
    			t0 = space();
    			div1 = element("div");
    			create_component(classdropdown.$$.fragment);
    			t1 = space();
    			table = element("table");
    			tr0 = element("tr");
    			th0 = element("th");
    			h30 = element("h3");
    			h30.textContent = "Combat Engravings";
    			t3 = space();
    			th1 = element("th");
    			h31 = element("h3");
    			h31.textContent = "Lv.1";
    			t5 = space();
    			th2 = element("th");
    			h32 = element("h3");
    			h32.textContent = "Lv.2";
    			t7 = space();
    			th3 = element("th");
    			h33 = element("h3");
    			h33.textContent = "Lv.3";
    			t9 = space();
    			th4 = element("th");
    			h34 = element("h3");
    			h34.textContent = "+";
    			t11 = space();
    			th5 = element("th");
    			img0 = element("img");
    			t12 = space();
    			img1 = element("img");
    			t13 = space();
    			th6 = element("th");
    			img2 = element("img");
    			t14 = space();
    			img3 = element("img");
    			t15 = space();
    			th7 = element("th");
    			img4 = element("img");
    			t16 = space();
    			img5 = element("img");
    			t17 = space();
    			th8 = element("th");
    			img6 = element("img");
    			t18 = space();
    			img7 = element("img");
    			t19 = space();
    			th9 = element("th");
    			img8 = element("img");
    			t20 = space();
    			img9 = element("img");
    			t21 = space();
    			th10 = element("th");
    			img10 = element("img");
    			t22 = space();
    			img11 = element("img");
    			t23 = space();
    			th11 = element("th");
    			img12 = element("img");
    			t24 = space();
    			img13 = element("img");
    			t25 = space();

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t26 = space();
    			create_component(engravingrow.$$.fragment);
    			t27 = space();
    			tr1 = element("tr");
    			th12 = element("th");
    			h35 = element("h3");
    			h35.textContent = "Negative Engravings";
    			t29 = space();
    			th13 = element("th");
    			h36 = element("h3");
    			h36.textContent = "Lv.1";
    			t31 = space();
    			th14 = element("th");
    			h37 = element("h3");
    			h37.textContent = "Lv.2";
    			t33 = space();
    			th15 = element("th");
    			h38 = element("h3");
    			h38.textContent = "Lv.3";
    			t35 = space();
    			th16 = element("th");
    			h39 = element("h3");
    			h39.textContent = "+";
    			t37 = space();
    			th17 = element("th");
    			t38 = space();
    			th18 = element("th");
    			t39 = space();
    			th19 = element("th");
    			t40 = space();
    			th20 = element("th");
    			t41 = space();
    			th21 = element("th");
    			t42 = space();
    			th22 = element("th");
    			t43 = space();
    			th23 = element("th");
    			t44 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div0, "class", "class-icon-container svelte-1799ozp");
    			add_location(div0, file$1, 19, 4, 682);
    			attr_dev(div1, "class", "class-dropdown-container svelte-1799ozp");
    			add_location(div1, file$1, 24, 4, 841);
    			attr_dev(div2, "class", "class-container svelte-1799ozp");
    			add_location(div2, file$1, 18, 0, 647);
    			attr_dev(h30, "class", "combat-engravings-h3 svelte-1799ozp");
    			add_location(h30, file$1, 30, 54, 1029);
    			attr_dev(th0, "class", "engraving-selection-head top-head svelte-1799ozp");
    			add_location(th0, file$1, 30, 8, 983);
    			attr_dev(h31, "class", "svelte-1799ozp");
    			add_location(h31, file$1, 31, 50, 1141);
    			attr_dev(th1, "class", "engraving-nodes-head top-head svelte-1799ozp");
    			add_location(th1, file$1, 31, 8, 1099);
    			attr_dev(h32, "class", "svelte-1799ozp");
    			add_location(h32, file$1, 32, 50, 1211);
    			attr_dev(th2, "class", "engraving-nodes-head top-head svelte-1799ozp");
    			add_location(th2, file$1, 32, 8, 1169);
    			attr_dev(h33, "class", "svelte-1799ozp");
    			add_location(h33, file$1, 33, 50, 1281);
    			attr_dev(th3, "class", "engraving-nodes-head top-head svelte-1799ozp");
    			add_location(th3, file$1, 33, 8, 1239);
    			attr_dev(h34, "class", "svelte-1799ozp");
    			add_location(h34, file$1, 34, 56, 1357);
    			attr_dev(th4, "class", "engraving-nodes-extra-head top-head svelte-1799ozp");
    			add_location(th4, file$1, 34, 8, 1309);
    			if (!src_url_equal(img0.src, img0_src_value = "./images/rarity_bgs/leg_bg.png")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "Legendary Item Background");
    			attr_dev(img0, "class", "rarity-img svelte-1799ozp");
    			add_location(img0, file$1, 36, 12, 1434);
    			if (!src_url_equal(img1.src, img1_src_value = "./images/equipment/leg_engravingbook.png")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "Engraving Books");
    			attr_dev(img1, "class", "equipment-img svelte-1799ozp");
    			add_location(img1, file$1, 37, 12, 1541);
    			attr_dev(th5, "class", "equipment-header top-head svelte-1799ozp");
    			add_location(th5, file$1, 35, 8, 1382);
    			if (!src_url_equal(img2.src, img2_src_value = "./images/rarity_bgs/relic_bg.png")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "Relic Item Background");
    			attr_dev(img2, "class", "rarity-img svelte-1799ozp");
    			add_location(img2, file$1, 40, 12, 1714);
    			if (!src_url_equal(img3.src, img3_src_value = "./images/equipment/relic_necklace.png")) attr_dev(img3, "src", img3_src_value);
    			attr_dev(img3, "alt", "Necklace");
    			attr_dev(img3, "class", "equipment-img svelte-1799ozp");
    			add_location(img3, file$1, 41, 12, 1819);
    			attr_dev(th6, "class", "equipment-header top-head svelte-1799ozp");
    			add_location(th6, file$1, 39, 8, 1662);
    			if (!src_url_equal(img4.src, img4_src_value = "./images/rarity_bgs/relic_bg.png")) attr_dev(img4, "src", img4_src_value);
    			attr_dev(img4, "alt", "Relic Item Background");
    			attr_dev(img4, "class", "rarity-img svelte-1799ozp");
    			add_location(img4, file$1, 44, 12, 1982);
    			if (!src_url_equal(img5.src, img5_src_value = "./images/equipment/relic_earring.png")) attr_dev(img5, "src", img5_src_value);
    			attr_dev(img5, "alt", "Earring1");
    			attr_dev(img5, "class", "equipment-img svelte-1799ozp");
    			add_location(img5, file$1, 45, 12, 2087);
    			attr_dev(th7, "class", "equipment-header top-head svelte-1799ozp");
    			add_location(th7, file$1, 43, 8, 1930);
    			if (!src_url_equal(img6.src, img6_src_value = "./images/rarity_bgs/relic_bg.png")) attr_dev(img6, "src", img6_src_value);
    			attr_dev(img6, "alt", "Relic Item Background");
    			attr_dev(img6, "class", "rarity-img svelte-1799ozp");
    			add_location(img6, file$1, 48, 12, 2249);
    			if (!src_url_equal(img7.src, img7_src_value = "./images/equipment/relic_earring.png")) attr_dev(img7, "src", img7_src_value);
    			attr_dev(img7, "alt", "Earring2");
    			attr_dev(img7, "class", "equipment-img svelte-1799ozp");
    			add_location(img7, file$1, 49, 12, 2354);
    			attr_dev(th8, "class", "equipment-header top-head svelte-1799ozp");
    			add_location(th8, file$1, 47, 8, 2197);
    			if (!src_url_equal(img8.src, img8_src_value = "./images/rarity_bgs/relic_bg.png")) attr_dev(img8, "src", img8_src_value);
    			attr_dev(img8, "alt", "Relic Item Background");
    			attr_dev(img8, "class", "rarity-img svelte-1799ozp");
    			add_location(img8, file$1, 52, 12, 2516);
    			if (!src_url_equal(img9.src, img9_src_value = "./images/equipment/relic_ring.png")) attr_dev(img9, "src", img9_src_value);
    			attr_dev(img9, "alt", "Ring1");
    			attr_dev(img9, "class", "equipment-img svelte-1799ozp");
    			add_location(img9, file$1, 53, 12, 2621);
    			attr_dev(th9, "class", "equipment-header top-head svelte-1799ozp");
    			add_location(th9, file$1, 51, 8, 2464);
    			if (!src_url_equal(img10.src, img10_src_value = "./images/rarity_bgs/relic_bg.png")) attr_dev(img10, "src", img10_src_value);
    			attr_dev(img10, "alt", "Relic Item Background");
    			attr_dev(img10, "class", "rarity-img svelte-1799ozp");
    			add_location(img10, file$1, 56, 12, 2777);
    			if (!src_url_equal(img11.src, img11_src_value = "./images/equipment/relic_ring.png")) attr_dev(img11, "src", img11_src_value);
    			attr_dev(img11, "alt", "Ring2");
    			attr_dev(img11, "class", "equipment-img svelte-1799ozp");
    			add_location(img11, file$1, 57, 12, 2882);
    			attr_dev(th10, "class", "equipment-header top-head svelte-1799ozp");
    			add_location(th10, file$1, 55, 8, 2725);
    			if (!src_url_equal(img12.src, img12_src_value = "./images/rarity_bgs/relic_bg.png")) attr_dev(img12, "src", img12_src_value);
    			attr_dev(img12, "alt", "Relic Item Background");
    			attr_dev(img12, "class", "rarity-img svelte-1799ozp");
    			add_location(img12, file$1, 60, 12, 3038);
    			if (!src_url_equal(img13.src, img13_src_value = "./images/equipment/relic_stone.png")) attr_dev(img13, "src", img13_src_value);
    			attr_dev(img13, "alt", "Ability Stone");
    			attr_dev(img13, "class", "equipment-img svelte-1799ozp");
    			add_location(img13, file$1, 61, 12, 3143);
    			attr_dev(th11, "class", "equipment-header top-head svelte-1799ozp");
    			add_location(th11, file$1, 59, 8, 2986);
    			attr_dev(tr0, "class", "svelte-1799ozp");
    			add_location(tr0, file$1, 29, 4, 969);
    			attr_dev(h35, "class", "combat-engravings-h3 svelte-1799ozp");
    			add_location(h35, file$1, 69, 45, 3555);
    			attr_dev(th12, "class", "engraving-selection-head svelte-1799ozp");
    			add_location(th12, file$1, 69, 8, 3518);
    			attr_dev(h36, "class", "svelte-1799ozp");
    			add_location(h36, file$1, 70, 41, 3660);
    			attr_dev(th13, "class", "engraving-nodes-head svelte-1799ozp");
    			add_location(th13, file$1, 70, 8, 3627);
    			attr_dev(h37, "class", "svelte-1799ozp");
    			add_location(h37, file$1, 71, 41, 3721);
    			attr_dev(th14, "class", "engraving-nodes-head svelte-1799ozp");
    			add_location(th14, file$1, 71, 8, 3688);
    			attr_dev(h38, "class", "svelte-1799ozp");
    			add_location(h38, file$1, 72, 41, 3782);
    			attr_dev(th15, "class", "engraving-nodes-head svelte-1799ozp");
    			add_location(th15, file$1, 72, 8, 3749);
    			attr_dev(h39, "class", "svelte-1799ozp");
    			add_location(h39, file$1, 73, 47, 3849);
    			attr_dev(th16, "class", "engraving-nodes-extra-head svelte-1799ozp");
    			add_location(th16, file$1, 73, 8, 3810);
    			attr_dev(th17, "class", "equipment-header svelte-1799ozp");
    			add_location(th17, file$1, 74, 8, 3874);
    			attr_dev(th18, "class", "equipment-header svelte-1799ozp");
    			add_location(th18, file$1, 75, 8, 3918);
    			attr_dev(th19, "class", "equipment-header svelte-1799ozp");
    			add_location(th19, file$1, 76, 8, 3962);
    			attr_dev(th20, "class", "equipment-header svelte-1799ozp");
    			add_location(th20, file$1, 77, 8, 4006);
    			attr_dev(th21, "class", "equipment-header svelte-1799ozp");
    			add_location(th21, file$1, 78, 8, 4050);
    			attr_dev(th22, "class", "equipment-header svelte-1799ozp");
    			add_location(th22, file$1, 79, 8, 4094);
    			attr_dev(th23, "class", "equipment-header svelte-1799ozp");
    			add_location(th23, file$1, 80, 8, 4138);
    			attr_dev(tr1, "class", "svelte-1799ozp");
    			add_location(tr1, file$1, 68, 4, 3504);
    			attr_dev(table, "class", "svelte-1799ozp");
    			add_location(table, file$1, 28, 0, 956);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			if (if_block) if_block.m(div0, null);
    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			mount_component(classdropdown, div1, null);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, table, anchor);
    			append_dev(table, tr0);
    			append_dev(tr0, th0);
    			append_dev(th0, h30);
    			append_dev(tr0, t3);
    			append_dev(tr0, th1);
    			append_dev(th1, h31);
    			append_dev(tr0, t5);
    			append_dev(tr0, th2);
    			append_dev(th2, h32);
    			append_dev(tr0, t7);
    			append_dev(tr0, th3);
    			append_dev(th3, h33);
    			append_dev(tr0, t9);
    			append_dev(tr0, th4);
    			append_dev(th4, h34);
    			append_dev(tr0, t11);
    			append_dev(tr0, th5);
    			append_dev(th5, img0);
    			append_dev(th5, t12);
    			append_dev(th5, img1);
    			append_dev(tr0, t13);
    			append_dev(tr0, th6);
    			append_dev(th6, img2);
    			append_dev(th6, t14);
    			append_dev(th6, img3);
    			append_dev(tr0, t15);
    			append_dev(tr0, th7);
    			append_dev(th7, img4);
    			append_dev(th7, t16);
    			append_dev(th7, img5);
    			append_dev(tr0, t17);
    			append_dev(tr0, th8);
    			append_dev(th8, img6);
    			append_dev(th8, t18);
    			append_dev(th8, img7);
    			append_dev(tr0, t19);
    			append_dev(tr0, th9);
    			append_dev(th9, img8);
    			append_dev(th9, t20);
    			append_dev(th9, img9);
    			append_dev(tr0, t21);
    			append_dev(tr0, th10);
    			append_dev(th10, img10);
    			append_dev(th10, t22);
    			append_dev(th10, img11);
    			append_dev(tr0, t23);
    			append_dev(tr0, th11);
    			append_dev(th11, img12);
    			append_dev(th11, t24);
    			append_dev(th11, img13);
    			append_dev(table, t25);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(table, null);
    			}

    			append_dev(table, t26);
    			mount_component(engravingrow, table, null);
    			append_dev(table, t27);
    			append_dev(table, tr1);
    			append_dev(tr1, th12);
    			append_dev(th12, h35);
    			append_dev(tr1, t29);
    			append_dev(tr1, th13);
    			append_dev(th13, h36);
    			append_dev(tr1, t31);
    			append_dev(tr1, th14);
    			append_dev(th14, h37);
    			append_dev(tr1, t33);
    			append_dev(tr1, th15);
    			append_dev(th15, h38);
    			append_dev(tr1, t35);
    			append_dev(tr1, th16);
    			append_dev(th16, h39);
    			append_dev(tr1, t37);
    			append_dev(tr1, th17);
    			append_dev(tr1, t38);
    			append_dev(tr1, th18);
    			append_dev(tr1, t39);
    			append_dev(tr1, th19);
    			append_dev(tr1, t40);
    			append_dev(tr1, th20);
    			append_dev(tr1, t41);
    			append_dev(tr1, th21);
    			append_dev(tr1, t42);
    			append_dev(tr1, th22);
    			append_dev(tr1, t43);
    			append_dev(tr1, th23);
    			append_dev(table, t44);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(table, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*advClass*/ ctx[0] != "") {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(div0, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*$SelectedEngravings*/ 4) {
    				each_value_1 = /*$SelectedEngravings*/ ctx[2];
    				validate_each_argument(each_value_1);
    				group_outros();
    				validate_each_keys(ctx, each_value_1, get_each_context_1, get_key);
    				each_blocks_1 = update_keyed_each(each_blocks_1, dirty, get_key, 1, ctx, each_value_1, each0_lookup, table, outro_and_destroy_block, create_each_block_1, t26, get_each_context_1);
    				check_outros();
    			}

    			if (dirty & /*$NegativeEngravings*/ 8) {
    				each_value = /*$NegativeEngravings*/ ctx[3];
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context, get_key_1);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key_1, 1, ctx, each_value, each1_lookup, table, outro_and_destroy_block, create_each_block, null, get_each_context);
    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(classdropdown.$$.fragment, local);

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks_1[i]);
    			}

    			transition_in(engravingrow.$$.fragment, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(classdropdown.$$.fragment, local);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				transition_out(each_blocks_1[i]);
    			}

    			transition_out(engravingrow.$$.fragment, local);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (if_block) if_block.d();
    			destroy_component(classdropdown);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(table);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].d();
    			}

    			destroy_component(engravingrow);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let $SelectedEngravings;
    	let $NegativeEngravings;
    	validate_store(SelectedEngravings, 'SelectedEngravings');
    	component_subscribe($$self, SelectedEngravings, $$value => $$invalidate(2, $SelectedEngravings = $$value));
    	validate_store(NegativeEngravings, 'NegativeEngravings');
    	component_subscribe($$self, NegativeEngravings, $$value => $$invalidate(3, $NegativeEngravings = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Engraving_organizer', slots, []);
    	let advClass = "";
    	let classIconURL = "";

    	const classChange = e => {
    		$$invalidate(0, advClass = e.detail);
    		$$invalidate(1, classIconURL = advClass.toLowerCase().replace(" ", ""));
    		$$invalidate(1, classIconURL = './images/class_icons/png/' + classIconURL + ".png");
    	};

    	console.log((document.currentScript && document.currentScript.src || new URL('bundle.js', document.baseURI).href));
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<Engraving_organizer> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		ClassDropdown,
    		EngravingRow: Engraving_row,
    		SelectedClass,
    		SelectedEngravings,
    		NegativeEngravings,
    		advClass,
    		classIconURL,
    		classChange,
    		$SelectedEngravings,
    		$NegativeEngravings
    	});

    	$$self.$inject_state = $$props => {
    		if ('advClass' in $$props) $$invalidate(0, advClass = $$props.advClass);
    		if ('classIconURL' in $$props) $$invalidate(1, classIconURL = $$props.classIconURL);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [advClass, classIconURL, $SelectedEngravings, $NegativeEngravings, classChange];
    }

    class Engraving_organizer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Engraving_organizer",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.49.0 */
    const file = "src\\App.svelte";

    function create_fragment(ctx) {
    	let title;
    	let t0;
    	let t1;
    	let t2;
    	let header;
    	let t3;
    	let main;
    	let div3;
    	let div2;
    	let div0;
    	let t4;
    	let div1;
    	let t5;
    	let div4;
    	let engravingsorganizer;
    	let current;

    	header = new Header({
    			props: {
    				tabs: /*tabs*/ ctx[1],
    				activeTab: /*activeTab*/ ctx[0]
    			},
    			$$inline: true
    		});

    	header.$on("tabChange", /*tabChange*/ ctx[2]);
    	engravingsorganizer = new Engraving_organizer({ $$inline: true });

    	const block = {
    		c: function create() {
    			title = element("title");
    			t0 = text("Soosh.site - ");
    			t1 = text(/*activeTab*/ ctx[0]);
    			t2 = space();
    			create_component(header.$$.fragment);
    			t3 = space();
    			main = element("main");
    			div3 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			t4 = space();
    			div1 = element("div");
    			t5 = space();
    			div4 = element("div");
    			create_component(engravingsorganizer.$$.fragment);
    			add_location(title, file, 26, 0, 654);
    			attr_dev(div0, "class", "background-image-gradient-top svelte-1x0mm72");
    			add_location(div0, file, 32, 12, 836);
    			attr_dev(div1, "class", "background-image-gradient-bottom svelte-1x0mm72");
    			add_location(div1, file, 33, 12, 898);
    			attr_dev(div2, "class", "background-image svelte-1x0mm72");
    			add_location(div2, file, 31, 8, 793);
    			attr_dev(div3, "class", "background svelte-1x0mm72");
    			add_location(div3, file, 30, 4, 760);
    			attr_dev(div4, "class", "main-container svelte-1x0mm72");
    			add_location(div4, file, 38, 4, 991);
    			add_location(main, file, 29, 0, 749);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, title, anchor);
    			append_dev(title, t0);
    			append_dev(title, t1);
    			insert_dev(target, t2, anchor);
    			mount_component(header, target, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, main, anchor);
    			append_dev(main, div3);
    			append_dev(div3, div2);
    			append_dev(div2, div0);
    			append_dev(div2, t4);
    			append_dev(div2, div1);
    			append_dev(main, t5);
    			append_dev(main, div4);
    			mount_component(engravingsorganizer, div4, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*activeTab*/ 1) set_data_dev(t1, /*activeTab*/ ctx[0]);
    			const header_changes = {};
    			if (dirty & /*activeTab*/ 1) header_changes.activeTab = /*activeTab*/ ctx[0];
    			header.$set(header_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);
    			transition_in(engravingsorganizer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			transition_out(engravingsorganizer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(title);
    			if (detaching) detach_dev(t2);
    			destroy_component(header, detaching);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(main);
    			destroy_component(engravingsorganizer);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let tabs = ['Home', 'Engravings', 'Damage'];
    	let activeTab = 'Engravings';

    	const tabChange = e => {
    		$$invalidate(0, activeTab = e.detail);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Header,
    		EngravingsOrganizer: Engraving_organizer,
    		tabs,
    		activeTab,
    		tabChange
    	});

    	$$self.$inject_state = $$props => {
    		if ('tabs' in $$props) $$invalidate(1, tabs = $$props.tabs);
    		if ('activeTab' in $$props) $$invalidate(0, activeTab = $$props.activeTab);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [activeTab, tabs, tabChange];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
