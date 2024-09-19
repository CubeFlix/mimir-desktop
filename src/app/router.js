/* router.js - Page router. */

import { match } from 'path-to-regexp';
import { isElement, elem } from "../lib.js";

// A route object.
class CfxRoute {
    // Create the route. Takes a URL path template and a render function. The 
    // render function will take the URL accessed and a parameter object. 
    // Optional onRender function to be called on render.
    constructor(url, render, onRender, onExit) {
        this.url = url;
        this.match = match(url, { decode: decodeURIComponent });
        this.render = render;
        this.onRender = onRender;
        this.onExit = onExit;
    }
}

// An error handler object.
class CfxErrorHandler {
    // Create the error handler. Takes an error code to match and a render 
    // function. The render function will take the URL accessed and associated
    // error information.
    constructor(code, render) {
        this.code = code;
        this.match = match(url, { decode: decodeURIComponent });
        this.render = render;
    }
}

// The router.
class CfxRouter {
    // Create the router. Takes a base element to render to and a list of route objects.
    constructor(element) {
        this.root = element;
        this.routes = [];
        this.errorHandlers = {};
        this.onServe = null;
        this.serving = false;

        // Current URL.
        this.url = "";
        this.route = null;
    }

    // Add a route.
    addRoute(route) {
        this.routes.push(route);
    }

    // Add an error handler.
    addErrorHandler(handler) {
        this.errorHandlers[handler.code] = handler;
    }

    // Serve the router.
    async serve(go) {
        // Bind to any location changes. 
        window.addEventListener("click", this.handleLinkClick.bind(this));
        window.addEventListener("popstate", this.handlePopState.bind(this));

        if (window.sessionStorage.getItem("cfx-router-url")) {
            await this.navigate(window.sessionStorage.getItem("cfx-router-url"));
        } else {
            await this.navigate(go ? go : "");
        }
        
        this.serving = true;
        if (this.onServe) {
            this.onServe(this);
        }
    }

    // Handle clicking a link.
    handleLinkClick(e) {
        // Find the A element the user clicked on, if it exists.
        var currentNode = e.target;
        while (currentNode && currentNode.tagName != "A") {
            currentNode = currentNode.parentNode;
        }
        if (!currentNode || currentNode.tagName != "A") {
            return false;
        }
        const linkElem = currentNode;

        // Check if the link element is contained within a `cfx-router-no-link` element.
        while (currentNode.parentNode) {
            if (currentNode.getAttribute("cfx-router-no-link")) {
                return false;
            }
            currentNode = currentNode.parentNode;
        }

        const url = linkElem.getAttribute("href");
        if (url == null) {
            return false;
        }
        if (url.startsWith("#")) {
            e.preventDefault();
            return false;
        }

        // Takeover the navigation with the router.
        e.preventDefault();
        return this.navigate(url);
    }

    // Handle a pop state event.
    handlePopState(e) {
        // Takeover the navigation with the router.
        return this.navigate(window.location.href);
    }

    // Navigate to a page.
    async navigate(url) {
        if (this.route) {
            if (this.route.onExit) await this.route.onExit();
        }
        this.route = null;
        this.url = url;
        window.sessionStorage.setItem("cfx-router-url", url);
        await this.render();
    }

    // Match a URL to a route.
    match(url) {
        for (const route of this.routes) {
            const match = route.match(url);
            if (match) {
                return { route: route, params: match.params };
            }
        }
        return null;
    }

    // Change the title of the window.
    setTitle(title) {
        window.mimirApi.setTitle(title);
    }

    // Render the page.
    async render() {
        const match = this.match(this.url);
        if (!match) {
            this.error(404, this.url);
            return false;
        }
        const { route, params } = match;
        
        let rendered;
        try {
            rendered = await route.render(this.url, params, this);
            if (!isElement(rendered)) {
                throw new Error(`Rendered object is not a DOM object. Got ${rendered} instead.`);
            }
            this.root.innerHTML = "";
            this.root.append(rendered);
            if (route.onRender) route.onRender();
            this.route = route;
            return true;
        } catch (e) {
            console.trace(e);
            this.error(500, e);
            return false;
        }
    }

    // Handle an error.
    async error(code, data) {
        const handler = this.errorHandlers[code];
        if (!handler) {
            this.defaultErrorHandler(code, data);
            return false;
        }

        let rendered;
        try {
            rendered = await handler.render(this.url, data, this);
            if (!isElement(rendered)) {
                throw new Error(`Rendered object is not a DOM object. Got ${rendered} instead.`);
            }
            this.root.innerHTML = "";
            this.root.append(rendered);
            return true;
        } catch (e) {
            console.trace(e);
            this.defaultErrorHandler(500, e);
            return false;
        }
    }

    // Display an error.
    displayError(titleText, bodyText) {
        const container = elem("div");
        const header = elem("h1");
        const body = elem("p");
        
        header.innerText = titleText;
        body.innerText = bodyText;
        container.append(header, body);

        this.root.innerHTML = "";
        this.root.append(container);
    }

    // Default error handler.
    defaultErrorHandler(code, data) {
        this.displayError(`Error ${code}`, this.getDefaultErrorText(code, data));
    }

    // Get default error text.
    getDefaultErrorText(code, data) {
        switch (code) {
            case 404:
                return `Couldn't resolve path: ${data}`;
            case 500:
                return `Internal server error: ${data}`;
            default:
                return data ? `Error: ${data}.` : `Error. No additional information provided.`;
        }
    }
}

export { CfxRoute, CfxErrorHandler, CfxRouter };