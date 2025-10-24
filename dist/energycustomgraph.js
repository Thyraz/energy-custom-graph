/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */ /* global Reflect, Promise, SuppressedError, Symbol, Iterator */ var $24c52f343453d62d$var$extendStatics = function(d, b) {
    $24c52f343453d62d$var$extendStatics = Object.setPrototypeOf || ({
        __proto__: []
    }) instanceof Array && function(d, b) {
        d.__proto__ = b;
    } || function(d, b) {
        for(var p in b)if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
    };
    return $24c52f343453d62d$var$extendStatics(d, b);
};
function $24c52f343453d62d$export$a8ba968b8961cb8a(d, b) {
    if (typeof b !== "function" && b !== null) throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
    $24c52f343453d62d$var$extendStatics(d, b);
    function __() {
        this.constructor = d;
    }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}
var $24c52f343453d62d$export$18ce0697a983be9b = function() {
    $24c52f343453d62d$export$18ce0697a983be9b = Object.assign || function __assign(t) {
        for(var s, i = 1, n = arguments.length; i < n; i++){
            s = arguments[i];
            for(var p in s)if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return $24c52f343453d62d$export$18ce0697a983be9b.apply(this, arguments);
};
function $24c52f343453d62d$export$3c9a16f847548506(s, e) {
    var t = {};
    for(var p in s)if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function") {
        for(var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++)if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
    }
    return t;
}
function $24c52f343453d62d$export$29e00dfd3077644b(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function $24c52f343453d62d$export$d5ad3fd78186038f(paramIndex, decorator) {
    return function(target, key) {
        decorator(target, key, paramIndex);
    };
}
function $24c52f343453d62d$export$3a84e1ae4e97e9b0(ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) {
        if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected");
        return f;
    }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for(var i = decorators.length - 1; i >= 0; i--){
        var context = {};
        for(var p in contextIn)context[p] = p === "access" ? {} : contextIn[p];
        for(var p in contextIn.access)context.access[p] = contextIn.access[p];
        context.addInitializer = function(f) {
            if (done) throw new TypeError("Cannot add initializers after decoration has completed");
            extraInitializers.push(accept(f || null));
        };
        var result = (0, decorators[i])(kind === "accessor" ? {
            get: descriptor.get,
            set: descriptor.set
        } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        } else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
}
function $24c52f343453d62d$export$d831c04e792af3d(thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for(var i = 0; i < initializers.length; i++)value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    return useValue ? value : void 0;
}
function $24c52f343453d62d$export$6a2a36740a146cb8(x) {
    return typeof x === "symbol" ? x : "".concat(x);
}
function $24c52f343453d62d$export$d1a06452d3489bc7(f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", {
        configurable: true,
        value: prefix ? "".concat(prefix, " ", name) : name
    });
}
function $24c52f343453d62d$export$f1db080c865becb9(metadataKey, metadataValue) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(metadataKey, metadataValue);
}
function $24c52f343453d62d$export$1050f835b63b671e(thisArg, _arguments, P, generator) {
    function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
            resolve(value);
        });
    }
    return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
            try {
                step(generator.next(value));
            } catch (e) {
                reject(e);
            }
        }
        function rejected(value) {
            try {
                step(generator["throw"](value));
            } catch (e) {
                reject(e);
            }
        }
        function step(result) {
            result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}
function $24c52f343453d62d$export$67ebef60e6f28a6(thisArg, body) {
    var _ = {
        label: 0,
        sent: function() {
            if (t[0] & 1) throw t[1];
            return t[1];
        },
        trys: [],
        ops: []
    }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() {
        return this;
    }), g;
    function verb(n) {
        return function(v) {
            return step([
                n,
                v
            ]);
        };
    }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while(g && (g = 0, op[0] && (_ = 0)), _)try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [
                op[0] & 2,
                t.value
            ];
            switch(op[0]){
                case 0:
                case 1:
                    t = op;
                    break;
                case 4:
                    _.label++;
                    return {
                        value: op[1],
                        done: false
                    };
                case 5:
                    _.label++;
                    y = op[1];
                    op = [
                        0
                    ];
                    continue;
                case 7:
                    op = _.ops.pop();
                    _.trys.pop();
                    continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                        _ = 0;
                        continue;
                    }
                    if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
                        _.label = op[1];
                        break;
                    }
                    if (op[0] === 6 && _.label < t[1]) {
                        _.label = t[1];
                        t = op;
                        break;
                    }
                    if (t && _.label < t[2]) {
                        _.label = t[2];
                        _.ops.push(op);
                        break;
                    }
                    if (t[2]) _.ops.pop();
                    _.trys.pop();
                    continue;
            }
            op = body.call(thisArg, _);
        } catch (e) {
            op = [
                6,
                e
            ];
            y = 0;
        } finally{
            f = t = 0;
        }
        if (op[0] & 5) throw op[1];
        return {
            value: op[0] ? op[1] : void 0,
            done: true
        };
    }
}
var $24c52f343453d62d$export$45d3717a4c69092e = Object.create ? function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) desc = {
        enumerable: true,
        get: function() {
            return m[k];
        }
    };
    Object.defineProperty(o, k2, desc);
} : function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
};
function $24c52f343453d62d$export$f33643c0debef087(m, o) {
    for(var p in m)if (p !== "default" && !Object.prototype.hasOwnProperty.call(o, p)) $24c52f343453d62d$export$45d3717a4c69092e(o, m, p);
}
function $24c52f343453d62d$export$19a8beecd37a4c45(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function() {
            if (o && i >= o.length) o = void 0;
            return {
                value: o && o[i++],
                done: !o
            };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
}
function $24c52f343453d62d$export$8d051b38c9118094(o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while((n === void 0 || n-- > 0) && !(r = i.next()).done)ar.push(r.value);
    } catch (error) {
        e = {
            error: error
        };
    } finally{
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        } finally{
            if (e) throw e.error;
        }
    }
    return ar;
}
function $24c52f343453d62d$export$afc72e2116322959() {
    for(var ar = [], i = 0; i < arguments.length; i++)ar = ar.concat($24c52f343453d62d$export$8d051b38c9118094(arguments[i]));
    return ar;
}
function $24c52f343453d62d$export$6388937ca91ccae8() {
    for(var s = 0, i = 0, il = arguments.length; i < il; i++)s += arguments[i].length;
    for(var r = Array(s), k = 0, i = 0; i < il; i++)for(var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)r[k] = a[j];
    return r;
}
function $24c52f343453d62d$export$1216008129fb82ed(to, from, pack) {
    if (pack || arguments.length === 2) {
        for(var i = 0, l = from.length, ar; i < l; i++)if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
}
function $24c52f343453d62d$export$10c90e4f7922046c(v) {
    return this instanceof $24c52f343453d62d$export$10c90e4f7922046c ? (this.v = v, this) : new $24c52f343453d62d$export$10c90e4f7922046c(v);
}
function $24c52f343453d62d$export$e427f37a30a4de9b(thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = Object.create((typeof AsyncIterator === "function" ? AsyncIterator : Object).prototype), verb("next"), verb("throw"), verb("return", awaitReturn), i[Symbol.asyncIterator] = function() {
        return this;
    }, i;
    function awaitReturn(f) {
        return function(v) {
            return Promise.resolve(v).then(f, reject);
        };
    }
    function verb(n, f) {
        if (g[n]) {
            i[n] = function(v) {
                return new Promise(function(a, b) {
                    q.push([
                        n,
                        v,
                        a,
                        b
                    ]) > 1 || resume(n, v);
                });
            };
            if (f) i[n] = f(i[n]);
        }
    }
    function resume(n, v) {
        try {
            step(g[n](v));
        } catch (e) {
            settle(q[0][3], e);
        }
    }
    function step(r) {
        r.value instanceof $24c52f343453d62d$export$10c90e4f7922046c ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r);
    }
    function fulfill(value) {
        resume("next", value);
    }
    function reject(value) {
        resume("throw", value);
    }
    function settle(f, v) {
        if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]);
    }
}
function $24c52f343453d62d$export$bbd80228419bb833(o) {
    var i, p;
    return i = {}, verb("next"), verb("throw", function(e) {
        throw e;
    }), verb("return"), i[Symbol.iterator] = function() {
        return this;
    }, i;
    function verb(n, f) {
        i[n] = o[n] ? function(v) {
            return (p = !p) ? {
                value: $24c52f343453d62d$export$10c90e4f7922046c(o[n](v)),
                done: false
            } : f ? f(v) : v;
        } : f;
    }
}
function $24c52f343453d62d$export$e3b29a3d6162315f(o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof $24c52f343453d62d$export$19a8beecd37a4c45 === "function" ? $24c52f343453d62d$export$19a8beecd37a4c45(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function() {
        return this;
    }, i);
    function verb(n) {
        i[n] = o[n] && function(v) {
            return new Promise(function(resolve, reject) {
                v = o[n](v), settle(resolve, reject, v.done, v.value);
            });
        };
    }
    function settle(resolve, reject, d, v) {
        Promise.resolve(v).then(function(v) {
            resolve({
                value: v,
                done: d
            });
        }, reject);
    }
}
function $24c52f343453d62d$export$4fb47efe1390b86f(cooked, raw) {
    if (Object.defineProperty) Object.defineProperty(cooked, "raw", {
        value: raw
    });
    else cooked.raw = raw;
    return cooked;
}
var $24c52f343453d62d$var$__setModuleDefault = Object.create ? function(o, v) {
    Object.defineProperty(o, "default", {
        enumerable: true,
        value: v
    });
} : function(o, v) {
    o["default"] = v;
};
var $24c52f343453d62d$var$ownKeys = function(o) {
    $24c52f343453d62d$var$ownKeys = Object.getOwnPropertyNames || function(o) {
        var ar = [];
        for(var k in o)if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
        return ar;
    };
    return $24c52f343453d62d$var$ownKeys(o);
};
function $24c52f343453d62d$export$c21735bcef00d192(mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) {
        for(var k = $24c52f343453d62d$var$ownKeys(mod), i = 0; i < k.length; i++)if (k[i] !== "default") $24c52f343453d62d$export$45d3717a4c69092e(result, mod, k[i]);
    }
    $24c52f343453d62d$var$__setModuleDefault(result, mod);
    return result;
}
function $24c52f343453d62d$export$da59b14a69baef04(mod) {
    return mod && mod.__esModule ? mod : {
        default: mod
    };
}
function $24c52f343453d62d$export$d5dcaf168c640c35(receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
}
function $24c52f343453d62d$export$d40a35129aaff81f(receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value), value;
}
function $24c52f343453d62d$export$81fdc39f203e4e04(state, receiver) {
    if (receiver === null || typeof receiver !== "object" && typeof receiver !== "function") throw new TypeError("Cannot use 'in' operator on non-object");
    return typeof state === "function" ? receiver === state : state.has(receiver);
}
function $24c52f343453d62d$export$88ac25d8e944e405(env, value, async) {
    if (value !== null && value !== void 0) {
        if (typeof value !== "object" && typeof value !== "function") throw new TypeError("Object expected.");
        var dispose, inner;
        if (async) {
            if (!Symbol.asyncDispose) throw new TypeError("Symbol.asyncDispose is not defined.");
            dispose = value[Symbol.asyncDispose];
        }
        if (dispose === void 0) {
            if (!Symbol.dispose) throw new TypeError("Symbol.dispose is not defined.");
            dispose = value[Symbol.dispose];
            if (async) inner = dispose;
        }
        if (typeof dispose !== "function") throw new TypeError("Object not disposable.");
        if (inner) dispose = function() {
            try {
                inner.call(this);
            } catch (e) {
                return Promise.reject(e);
            }
        };
        env.stack.push({
            value: value,
            dispose: dispose,
            async: async
        });
    } else if (async) env.stack.push({
        async: true
    });
    return value;
}
var $24c52f343453d62d$var$_SuppressedError = typeof SuppressedError === "function" ? SuppressedError : function(error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};
function $24c52f343453d62d$export$8f076105dc360e92(env) {
    function fail(e) {
        env.error = env.hasError ? new $24c52f343453d62d$var$_SuppressedError(e, env.error, "An error was suppressed during disposal.") : e;
        env.hasError = true;
    }
    var r, s = 0;
    function next() {
        while(r = env.stack.pop())try {
            if (!r.async && s === 1) return s = 0, env.stack.push(r), Promise.resolve().then(next);
            if (r.dispose) {
                var result = r.dispose.call(r.value);
                if (r.async) return s |= 2, Promise.resolve(result).then(next, function(e) {
                    fail(e);
                    return next();
                });
            } else s |= 1;
        } catch (e) {
            fail(e);
        }
        if (s === 1) return env.hasError ? Promise.reject(env.error) : Promise.resolve();
        if (env.hasError) throw env.error;
    }
    return next();
}
function $24c52f343453d62d$export$889dfb5d17574b0b(path, preserveJsx) {
    if (typeof path === "string" && /^\.\.?\//.test(path)) return path.replace(/\.(tsx)$|((?:\.d)?)((?:\.[^./]+?)?)\.([cm]?)ts$/i, function(m, tsx, d, ext, cm) {
        return tsx ? preserveJsx ? ".jsx" : ".js" : d && (!ext || !cm) ? m : d + ext + "." + cm.toLowerCase() + "js";
    });
    return path;
}
var $24c52f343453d62d$export$2e2bcd8739ae039 = {
    __extends: $24c52f343453d62d$export$a8ba968b8961cb8a,
    __assign: $24c52f343453d62d$export$18ce0697a983be9b,
    __rest: $24c52f343453d62d$export$3c9a16f847548506,
    __decorate: $24c52f343453d62d$export$29e00dfd3077644b,
    __param: $24c52f343453d62d$export$d5ad3fd78186038f,
    __esDecorate: $24c52f343453d62d$export$3a84e1ae4e97e9b0,
    __runInitializers: $24c52f343453d62d$export$d831c04e792af3d,
    __propKey: $24c52f343453d62d$export$6a2a36740a146cb8,
    __setFunctionName: $24c52f343453d62d$export$d1a06452d3489bc7,
    __metadata: $24c52f343453d62d$export$f1db080c865becb9,
    __awaiter: $24c52f343453d62d$export$1050f835b63b671e,
    __generator: $24c52f343453d62d$export$67ebef60e6f28a6,
    __createBinding: $24c52f343453d62d$export$45d3717a4c69092e,
    __exportStar: $24c52f343453d62d$export$f33643c0debef087,
    __values: $24c52f343453d62d$export$19a8beecd37a4c45,
    __read: $24c52f343453d62d$export$8d051b38c9118094,
    __spread: $24c52f343453d62d$export$afc72e2116322959,
    __spreadArrays: $24c52f343453d62d$export$6388937ca91ccae8,
    __spreadArray: $24c52f343453d62d$export$1216008129fb82ed,
    __await: $24c52f343453d62d$export$10c90e4f7922046c,
    __asyncGenerator: $24c52f343453d62d$export$e427f37a30a4de9b,
    __asyncDelegator: $24c52f343453d62d$export$bbd80228419bb833,
    __asyncValues: $24c52f343453d62d$export$e3b29a3d6162315f,
    __makeTemplateObject: $24c52f343453d62d$export$4fb47efe1390b86f,
    __importStar: $24c52f343453d62d$export$c21735bcef00d192,
    __importDefault: $24c52f343453d62d$export$da59b14a69baef04,
    __classPrivateFieldGet: $24c52f343453d62d$export$d5dcaf168c640c35,
    __classPrivateFieldSet: $24c52f343453d62d$export$d40a35129aaff81f,
    __classPrivateFieldIn: $24c52f343453d62d$export$81fdc39f203e4e04,
    __addDisposableResource: $24c52f343453d62d$export$88ac25d8e944e405,
    __disposeResources: $24c52f343453d62d$export$8f076105dc360e92,
    __rewriteRelativeImportExtension: $24c52f343453d62d$export$889dfb5d17574b0b
};


/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */ const $53e576283d0b4ca1$var$t = window, $53e576283d0b4ca1$export$b4d10f6001c083c2 = $53e576283d0b4ca1$var$t.ShadowRoot && (void 0 === $53e576283d0b4ca1$var$t.ShadyCSS || $53e576283d0b4ca1$var$t.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, $53e576283d0b4ca1$var$s = Symbol(), $53e576283d0b4ca1$var$n = new WeakMap;
class $53e576283d0b4ca1$export$505d1e8739bad805 {
    constructor(t, e, n){
        if (this._$cssResult$ = !0, n !== $53e576283d0b4ca1$var$s) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
        this.cssText = t, this.t = e;
    }
    get styleSheet() {
        let t = this.o;
        const s = this.t;
        if ($53e576283d0b4ca1$export$b4d10f6001c083c2 && void 0 === t) {
            const e = void 0 !== s && 1 === s.length;
            e && (t = $53e576283d0b4ca1$var$n.get(s)), void 0 === t && ((this.o = t = new CSSStyleSheet).replaceSync(this.cssText), e && $53e576283d0b4ca1$var$n.set(s, t));
        }
        return t;
    }
    toString() {
        return this.cssText;
    }
}
const $53e576283d0b4ca1$export$8d80f9cac07cdb3 = (t)=>new $53e576283d0b4ca1$export$505d1e8739bad805("string" == typeof t ? t : t + "", void 0, $53e576283d0b4ca1$var$s), $53e576283d0b4ca1$export$dbf350e5966cf602 = (t, ...e)=>{
    const n = 1 === t.length ? t[0] : e.reduce((e, s, n)=>e + ((t)=>{
            if (!0 === t._$cssResult$) return t.cssText;
            if ("number" == typeof t) return t;
            throw Error("Value passed to 'css' function must be a 'css' function result: " + t + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
        })(s) + t[n + 1], t[0]);
    return new $53e576283d0b4ca1$export$505d1e8739bad805(n, t, $53e576283d0b4ca1$var$s);
}, $53e576283d0b4ca1$export$2ca4a66ec4cecb90 = (s, n)=>{
    $53e576283d0b4ca1$export$b4d10f6001c083c2 ? s.adoptedStyleSheets = n.map((t)=>t instanceof CSSStyleSheet ? t : t.styleSheet) : n.forEach((e)=>{
        const n = document.createElement("style"), o = $53e576283d0b4ca1$var$t.litNonce;
        void 0 !== o && n.setAttribute("nonce", o), n.textContent = e.cssText, s.appendChild(n);
    });
}, $53e576283d0b4ca1$export$ee69dfd951e24778 = $53e576283d0b4ca1$export$b4d10f6001c083c2 ? (t)=>t : (t)=>t instanceof CSSStyleSheet ? ((t)=>{
        let e = "";
        for (const s of t.cssRules)e += s.cssText;
        return $53e576283d0b4ca1$export$8d80f9cac07cdb3(e);
    })(t) : t;


/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */ var $b22ad1691173679b$var$s;
const $b22ad1691173679b$var$e = window, $b22ad1691173679b$var$r = $b22ad1691173679b$var$e.trustedTypes, $b22ad1691173679b$var$h = $b22ad1691173679b$var$r ? $b22ad1691173679b$var$r.emptyScript : "", $b22ad1691173679b$var$o = $b22ad1691173679b$var$e.reactiveElementPolyfillSupport, $b22ad1691173679b$export$7312b35fbf521afb = {
    toAttribute (t, i) {
        switch(i){
            case Boolean:
                t = t ? $b22ad1691173679b$var$h : null;
                break;
            case Object:
            case Array:
                t = null == t ? t : JSON.stringify(t);
        }
        return t;
    },
    fromAttribute (t, i) {
        let s = t;
        switch(i){
            case Boolean:
                s = null !== t;
                break;
            case Number:
                s = null === t ? null : Number(t);
                break;
            case Object:
            case Array:
                try {
                    s = JSON.parse(t);
                } catch (t) {
                    s = null;
                }
        }
        return s;
    }
}, $b22ad1691173679b$export$53a6892c50694894 = (t, i)=>i !== t && (i == i || t == t), $b22ad1691173679b$var$l = {
    attribute: !0,
    type: String,
    converter: $b22ad1691173679b$export$7312b35fbf521afb,
    reflect: !1,
    hasChanged: $b22ad1691173679b$export$53a6892c50694894
}, $b22ad1691173679b$var$d = "finalized";
class $b22ad1691173679b$export$c7c07a37856565d extends HTMLElement {
    constructor(){
        super(), this._$Ei = new Map, this.isUpdatePending = !1, this.hasUpdated = !1, this._$El = null, this._$Eu();
    }
    static addInitializer(t) {
        var i;
        this.finalize(), (null !== (i = this.h) && void 0 !== i ? i : this.h = []).push(t);
    }
    static get observedAttributes() {
        this.finalize();
        const t = [];
        return this.elementProperties.forEach((i, s)=>{
            const e = this._$Ep(s, i);
            void 0 !== e && (this._$Ev.set(e, s), t.push(e));
        }), t;
    }
    static createProperty(t, i = $b22ad1691173679b$var$l) {
        if (i.state && (i.attribute = !1), this.finalize(), this.elementProperties.set(t, i), !i.noAccessor && !this.prototype.hasOwnProperty(t)) {
            const s = "symbol" == typeof t ? Symbol() : "__" + t, e = this.getPropertyDescriptor(t, s, i);
            void 0 !== e && Object.defineProperty(this.prototype, t, e);
        }
    }
    static getPropertyDescriptor(t, i, s) {
        return {
            get () {
                return this[i];
            },
            set (e) {
                const r = this[t];
                this[i] = e, this.requestUpdate(t, r, s);
            },
            configurable: !0,
            enumerable: !0
        };
    }
    static getPropertyOptions(t) {
        return this.elementProperties.get(t) || $b22ad1691173679b$var$l;
    }
    static finalize() {
        if (this.hasOwnProperty($b22ad1691173679b$var$d)) return !1;
        this[$b22ad1691173679b$var$d] = !0;
        const t = Object.getPrototypeOf(this);
        if (t.finalize(), void 0 !== t.h && (this.h = [
            ...t.h
        ]), this.elementProperties = new Map(t.elementProperties), this._$Ev = new Map, this.hasOwnProperty("properties")) {
            const t = this.properties, i = [
                ...Object.getOwnPropertyNames(t),
                ...Object.getOwnPropertySymbols(t)
            ];
            for (const s of i)this.createProperty(s, t[s]);
        }
        return this.elementStyles = this.finalizeStyles(this.styles), !0;
    }
    static finalizeStyles(i) {
        const s = [];
        if (Array.isArray(i)) {
            const e = new Set(i.flat(1 / 0).reverse());
            for (const i of e)s.unshift((0, $53e576283d0b4ca1$export$ee69dfd951e24778)(i));
        } else void 0 !== i && s.push((0, $53e576283d0b4ca1$export$ee69dfd951e24778)(i));
        return s;
    }
    static _$Ep(t, i) {
        const s = i.attribute;
        return !1 === s ? void 0 : "string" == typeof s ? s : "string" == typeof t ? t.toLowerCase() : void 0;
    }
    _$Eu() {
        var t;
        this._$E_ = new Promise((t)=>this.enableUpdating = t), this._$AL = new Map, this._$Eg(), this.requestUpdate(), null === (t = this.constructor.h) || void 0 === t || t.forEach((t)=>t(this));
    }
    addController(t) {
        var i, s;
        (null !== (i = this._$ES) && void 0 !== i ? i : this._$ES = []).push(t), void 0 !== this.renderRoot && this.isConnected && (null === (s = t.hostConnected) || void 0 === s || s.call(t));
    }
    removeController(t) {
        var i;
        null === (i = this._$ES) || void 0 === i || i.splice(this._$ES.indexOf(t) >>> 0, 1);
    }
    _$Eg() {
        this.constructor.elementProperties.forEach((t, i)=>{
            this.hasOwnProperty(i) && (this._$Ei.set(i, this[i]), delete this[i]);
        });
    }
    createRenderRoot() {
        var t;
        const s = null !== (t = this.shadowRoot) && void 0 !== t ? t : this.attachShadow(this.constructor.shadowRootOptions);
        return (0, $53e576283d0b4ca1$export$2ca4a66ec4cecb90)(s, this.constructor.elementStyles), s;
    }
    connectedCallback() {
        var t;
        void 0 === this.renderRoot && (this.renderRoot = this.createRenderRoot()), this.enableUpdating(!0), null === (t = this._$ES) || void 0 === t || t.forEach((t)=>{
            var i;
            return null === (i = t.hostConnected) || void 0 === i ? void 0 : i.call(t);
        });
    }
    enableUpdating(t) {}
    disconnectedCallback() {
        var t;
        null === (t = this._$ES) || void 0 === t || t.forEach((t)=>{
            var i;
            return null === (i = t.hostDisconnected) || void 0 === i ? void 0 : i.call(t);
        });
    }
    attributeChangedCallback(t, i, s) {
        this._$AK(t, s);
    }
    _$EO(t, i, s = $b22ad1691173679b$var$l) {
        var e;
        const r = this.constructor._$Ep(t, s);
        if (void 0 !== r && !0 === s.reflect) {
            const h = (void 0 !== (null === (e = s.converter) || void 0 === e ? void 0 : e.toAttribute) ? s.converter : $b22ad1691173679b$export$7312b35fbf521afb).toAttribute(i, s.type);
            this._$El = t, null == h ? this.removeAttribute(r) : this.setAttribute(r, h), this._$El = null;
        }
    }
    _$AK(t, i) {
        var s;
        const e = this.constructor, r = e._$Ev.get(t);
        if (void 0 !== r && this._$El !== r) {
            const t = e.getPropertyOptions(r), h = "function" == typeof t.converter ? {
                fromAttribute: t.converter
            } : void 0 !== (null === (s = t.converter) || void 0 === s ? void 0 : s.fromAttribute) ? t.converter : $b22ad1691173679b$export$7312b35fbf521afb;
            this._$El = r, this[r] = h.fromAttribute(i, t.type), this._$El = null;
        }
    }
    requestUpdate(t, i, s) {
        let e = !0;
        void 0 !== t && (((s = s || this.constructor.getPropertyOptions(t)).hasChanged || $b22ad1691173679b$export$53a6892c50694894)(this[t], i) ? (this._$AL.has(t) || this._$AL.set(t, i), !0 === s.reflect && this._$El !== t && (void 0 === this._$EC && (this._$EC = new Map), this._$EC.set(t, s))) : e = !1), !this.isUpdatePending && e && (this._$E_ = this._$Ej());
    }
    async _$Ej() {
        this.isUpdatePending = !0;
        try {
            await this._$E_;
        } catch (t) {
            Promise.reject(t);
        }
        const t = this.scheduleUpdate();
        return null != t && await t, !this.isUpdatePending;
    }
    scheduleUpdate() {
        return this.performUpdate();
    }
    performUpdate() {
        var t;
        if (!this.isUpdatePending) return;
        this.hasUpdated, this._$Ei && (this._$Ei.forEach((t, i)=>this[i] = t), this._$Ei = void 0);
        let i = !1;
        const s = this._$AL;
        try {
            i = this.shouldUpdate(s), i ? (this.willUpdate(s), null === (t = this._$ES) || void 0 === t || t.forEach((t)=>{
                var i;
                return null === (i = t.hostUpdate) || void 0 === i ? void 0 : i.call(t);
            }), this.update(s)) : this._$Ek();
        } catch (t) {
            throw i = !1, this._$Ek(), t;
        }
        i && this._$AE(s);
    }
    willUpdate(t) {}
    _$AE(t) {
        var i;
        null === (i = this._$ES) || void 0 === i || i.forEach((t)=>{
            var i;
            return null === (i = t.hostUpdated) || void 0 === i ? void 0 : i.call(t);
        }), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(t)), this.updated(t);
    }
    _$Ek() {
        this._$AL = new Map, this.isUpdatePending = !1;
    }
    get updateComplete() {
        return this.getUpdateComplete();
    }
    getUpdateComplete() {
        return this._$E_;
    }
    shouldUpdate(t) {
        return !0;
    }
    update(t) {
        void 0 !== this._$EC && (this._$EC.forEach((t, i)=>this._$EO(i, this[i], t)), this._$EC = void 0), this._$Ek();
    }
    updated(t) {}
    firstUpdated(t) {}
}
$b22ad1691173679b$export$c7c07a37856565d[$b22ad1691173679b$var$d] = !0, $b22ad1691173679b$export$c7c07a37856565d.elementProperties = new Map, $b22ad1691173679b$export$c7c07a37856565d.elementStyles = [], $b22ad1691173679b$export$c7c07a37856565d.shadowRootOptions = {
    mode: "open"
}, null == $b22ad1691173679b$var$o || $b22ad1691173679b$var$o({
    ReactiveElement: $b22ad1691173679b$export$c7c07a37856565d
}), (null !== ($b22ad1691173679b$var$s = $b22ad1691173679b$var$e.reactiveElementVersions) && void 0 !== $b22ad1691173679b$var$s ? $b22ad1691173679b$var$s : $b22ad1691173679b$var$e.reactiveElementVersions = []).push("1.6.3");


/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */ var $1cb21db0eb1a0be5$var$t;
const $1cb21db0eb1a0be5$var$i = window, $1cb21db0eb1a0be5$var$s = $1cb21db0eb1a0be5$var$i.trustedTypes, $1cb21db0eb1a0be5$var$e = $1cb21db0eb1a0be5$var$s ? $1cb21db0eb1a0be5$var$s.createPolicy("lit-html", {
    createHTML: (t)=>t
}) : void 0, $1cb21db0eb1a0be5$var$o = "$lit$", $1cb21db0eb1a0be5$var$n = `lit$${(Math.random() + "").slice(9)}$`, $1cb21db0eb1a0be5$var$l = "?" + $1cb21db0eb1a0be5$var$n, $1cb21db0eb1a0be5$var$h = `<${$1cb21db0eb1a0be5$var$l}>`, $1cb21db0eb1a0be5$var$r = document, $1cb21db0eb1a0be5$var$u = ()=>$1cb21db0eb1a0be5$var$r.createComment(""), $1cb21db0eb1a0be5$var$d = (t)=>null === t || "object" != typeof t && "function" != typeof t, $1cb21db0eb1a0be5$var$c = Array.isArray, $1cb21db0eb1a0be5$var$v = (t)=>$1cb21db0eb1a0be5$var$c(t) || "function" == typeof (null == t ? void 0 : t[Symbol.iterator]), $1cb21db0eb1a0be5$var$a = "[ \t\n\f\r]", $1cb21db0eb1a0be5$var$f = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, $1cb21db0eb1a0be5$var$_ = /-->/g, $1cb21db0eb1a0be5$var$m = />/g, $1cb21db0eb1a0be5$var$p = RegExp(`>|${$1cb21db0eb1a0be5$var$a}(?:([^\\s"'>=/]+)(${$1cb21db0eb1a0be5$var$a}*=${$1cb21db0eb1a0be5$var$a}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`, "g"), $1cb21db0eb1a0be5$var$g = /'/g, $1cb21db0eb1a0be5$var$$ = /"/g, $1cb21db0eb1a0be5$var$y = /^(?:script|style|textarea|title)$/i, $1cb21db0eb1a0be5$var$w = (t)=>(i, ...s)=>({
            _$litType$: t,
            strings: i,
            values: s
        }), $1cb21db0eb1a0be5$export$c0bb0b647f701bb5 = $1cb21db0eb1a0be5$var$w(1), $1cb21db0eb1a0be5$export$7ed1367e7fa1ad68 = $1cb21db0eb1a0be5$var$w(2), $1cb21db0eb1a0be5$export$9c068ae9cc5db4e8 = Symbol.for("lit-noChange"), $1cb21db0eb1a0be5$export$45b790e32b2810ee = Symbol.for("lit-nothing"), $1cb21db0eb1a0be5$var$E = new WeakMap, $1cb21db0eb1a0be5$var$C = $1cb21db0eb1a0be5$var$r.createTreeWalker($1cb21db0eb1a0be5$var$r, 129, null, !1);
function $1cb21db0eb1a0be5$var$P(t, i) {
    if (!Array.isArray(t) || !t.hasOwnProperty("raw")) throw Error("invalid template strings array");
    return void 0 !== $1cb21db0eb1a0be5$var$e ? $1cb21db0eb1a0be5$var$e.createHTML(i) : i;
}
const $1cb21db0eb1a0be5$var$V = (t, i)=>{
    const s = t.length - 1, e = [];
    let l, r = 2 === i ? "<svg>" : "", u = $1cb21db0eb1a0be5$var$f;
    for(let i = 0; i < s; i++){
        const s = t[i];
        let d, c, v = -1, a = 0;
        for(; a < s.length && (u.lastIndex = a, c = u.exec(s), null !== c);)a = u.lastIndex, u === $1cb21db0eb1a0be5$var$f ? "!--" === c[1] ? u = $1cb21db0eb1a0be5$var$_ : void 0 !== c[1] ? u = $1cb21db0eb1a0be5$var$m : void 0 !== c[2] ? ($1cb21db0eb1a0be5$var$y.test(c[2]) && (l = RegExp("</" + c[2], "g")), u = $1cb21db0eb1a0be5$var$p) : void 0 !== c[3] && (u = $1cb21db0eb1a0be5$var$p) : u === $1cb21db0eb1a0be5$var$p ? ">" === c[0] ? (u = null != l ? l : $1cb21db0eb1a0be5$var$f, v = -1) : void 0 === c[1] ? v = -2 : (v = u.lastIndex - c[2].length, d = c[1], u = void 0 === c[3] ? $1cb21db0eb1a0be5$var$p : '"' === c[3] ? $1cb21db0eb1a0be5$var$$ : $1cb21db0eb1a0be5$var$g) : u === $1cb21db0eb1a0be5$var$$ || u === $1cb21db0eb1a0be5$var$g ? u = $1cb21db0eb1a0be5$var$p : u === $1cb21db0eb1a0be5$var$_ || u === $1cb21db0eb1a0be5$var$m ? u = $1cb21db0eb1a0be5$var$f : (u = $1cb21db0eb1a0be5$var$p, l = void 0);
        const w = u === $1cb21db0eb1a0be5$var$p && t[i + 1].startsWith("/>") ? " " : "";
        r += u === $1cb21db0eb1a0be5$var$f ? s + $1cb21db0eb1a0be5$var$h : v >= 0 ? (e.push(d), s.slice(0, v) + $1cb21db0eb1a0be5$var$o + s.slice(v) + $1cb21db0eb1a0be5$var$n + w) : s + $1cb21db0eb1a0be5$var$n + (-2 === v ? (e.push(void 0), i) : w);
    }
    return [
        $1cb21db0eb1a0be5$var$P(t, r + (t[s] || "<?>") + (2 === i ? "</svg>" : "")),
        e
    ];
};
class $1cb21db0eb1a0be5$var$N {
    constructor({ strings: t, _$litType$: i }, e){
        let h;
        this.parts = [];
        let r = 0, d = 0;
        const c = t.length - 1, v = this.parts, [a, f] = $1cb21db0eb1a0be5$var$V(t, i);
        if (this.el = $1cb21db0eb1a0be5$var$N.createElement(a, e), $1cb21db0eb1a0be5$var$C.currentNode = this.el.content, 2 === i) {
            const t = this.el.content, i = t.firstChild;
            i.remove(), t.append(...i.childNodes);
        }
        for(; null !== (h = $1cb21db0eb1a0be5$var$C.nextNode()) && v.length < c;){
            if (1 === h.nodeType) {
                if (h.hasAttributes()) {
                    const t = [];
                    for (const i of h.getAttributeNames())if (i.endsWith($1cb21db0eb1a0be5$var$o) || i.startsWith($1cb21db0eb1a0be5$var$n)) {
                        const s = f[d++];
                        if (t.push(i), void 0 !== s) {
                            const t = h.getAttribute(s.toLowerCase() + $1cb21db0eb1a0be5$var$o).split($1cb21db0eb1a0be5$var$n), i = /([.?@])?(.*)/.exec(s);
                            v.push({
                                type: 1,
                                index: r,
                                name: i[2],
                                strings: t,
                                ctor: "." === i[1] ? $1cb21db0eb1a0be5$var$H : "?" === i[1] ? $1cb21db0eb1a0be5$var$L : "@" === i[1] ? $1cb21db0eb1a0be5$var$z : $1cb21db0eb1a0be5$var$k
                            });
                        } else v.push({
                            type: 6,
                            index: r
                        });
                    }
                    for (const i of t)h.removeAttribute(i);
                }
                if ($1cb21db0eb1a0be5$var$y.test(h.tagName)) {
                    const t = h.textContent.split($1cb21db0eb1a0be5$var$n), i = t.length - 1;
                    if (i > 0) {
                        h.textContent = $1cb21db0eb1a0be5$var$s ? $1cb21db0eb1a0be5$var$s.emptyScript : "";
                        for(let s = 0; s < i; s++)h.append(t[s], $1cb21db0eb1a0be5$var$u()), $1cb21db0eb1a0be5$var$C.nextNode(), v.push({
                            type: 2,
                            index: ++r
                        });
                        h.append(t[i], $1cb21db0eb1a0be5$var$u());
                    }
                }
            } else if (8 === h.nodeType) {
                if (h.data === $1cb21db0eb1a0be5$var$l) v.push({
                    type: 2,
                    index: r
                });
                else {
                    let t = -1;
                    for(; -1 !== (t = h.data.indexOf($1cb21db0eb1a0be5$var$n, t + 1));)v.push({
                        type: 7,
                        index: r
                    }), t += $1cb21db0eb1a0be5$var$n.length - 1;
                }
            }
            r++;
        }
    }
    static createElement(t, i) {
        const s = $1cb21db0eb1a0be5$var$r.createElement("template");
        return s.innerHTML = t, s;
    }
}
function $1cb21db0eb1a0be5$var$S(t, i, s = t, e) {
    var o, n, l, h;
    if (i === $1cb21db0eb1a0be5$export$9c068ae9cc5db4e8) return i;
    let r = void 0 !== e ? null === (o = s._$Co) || void 0 === o ? void 0 : o[e] : s._$Cl;
    const u = $1cb21db0eb1a0be5$var$d(i) ? void 0 : i._$litDirective$;
    return (null == r ? void 0 : r.constructor) !== u && (null === (n = null == r ? void 0 : r._$AO) || void 0 === n || n.call(r, !1), void 0 === u ? r = void 0 : (r = new u(t), r._$AT(t, s, e)), void 0 !== e ? (null !== (l = (h = s)._$Co) && void 0 !== l ? l : h._$Co = [])[e] = r : s._$Cl = r), void 0 !== r && (i = $1cb21db0eb1a0be5$var$S(t, r._$AS(t, i.values), r, e)), i;
}
class $1cb21db0eb1a0be5$var$M {
    constructor(t, i){
        this._$AV = [], this._$AN = void 0, this._$AD = t, this._$AM = i;
    }
    get parentNode() {
        return this._$AM.parentNode;
    }
    get _$AU() {
        return this._$AM._$AU;
    }
    u(t) {
        var i;
        const { el: { content: s }, parts: e } = this._$AD, o = (null !== (i = null == t ? void 0 : t.creationScope) && void 0 !== i ? i : $1cb21db0eb1a0be5$var$r).importNode(s, !0);
        $1cb21db0eb1a0be5$var$C.currentNode = o;
        let n = $1cb21db0eb1a0be5$var$C.nextNode(), l = 0, h = 0, u = e[0];
        for(; void 0 !== u;){
            if (l === u.index) {
                let i;
                2 === u.type ? i = new $1cb21db0eb1a0be5$var$R(n, n.nextSibling, this, t) : 1 === u.type ? i = new u.ctor(n, u.name, u.strings, this, t) : 6 === u.type && (i = new $1cb21db0eb1a0be5$var$Z(n, this, t)), this._$AV.push(i), u = e[++h];
            }
            l !== (null == u ? void 0 : u.index) && (n = $1cb21db0eb1a0be5$var$C.nextNode(), l++);
        }
        return $1cb21db0eb1a0be5$var$C.currentNode = $1cb21db0eb1a0be5$var$r, o;
    }
    v(t) {
        let i = 0;
        for (const s of this._$AV)void 0 !== s && (void 0 !== s.strings ? (s._$AI(t, s, i), i += s.strings.length - 2) : s._$AI(t[i])), i++;
    }
}
class $1cb21db0eb1a0be5$var$R {
    constructor(t, i, s, e){
        var o;
        this.type = 2, this._$AH = $1cb21db0eb1a0be5$export$45b790e32b2810ee, this._$AN = void 0, this._$AA = t, this._$AB = i, this._$AM = s, this.options = e, this._$Cp = null === (o = null == e ? void 0 : e.isConnected) || void 0 === o || o;
    }
    get _$AU() {
        var t, i;
        return null !== (i = null === (t = this._$AM) || void 0 === t ? void 0 : t._$AU) && void 0 !== i ? i : this._$Cp;
    }
    get parentNode() {
        let t = this._$AA.parentNode;
        const i = this._$AM;
        return void 0 !== i && 11 === (null == t ? void 0 : t.nodeType) && (t = i.parentNode), t;
    }
    get startNode() {
        return this._$AA;
    }
    get endNode() {
        return this._$AB;
    }
    _$AI(t, i = this) {
        t = $1cb21db0eb1a0be5$var$S(this, t, i), $1cb21db0eb1a0be5$var$d(t) ? t === $1cb21db0eb1a0be5$export$45b790e32b2810ee || null == t || "" === t ? (this._$AH !== $1cb21db0eb1a0be5$export$45b790e32b2810ee && this._$AR(), this._$AH = $1cb21db0eb1a0be5$export$45b790e32b2810ee) : t !== this._$AH && t !== $1cb21db0eb1a0be5$export$9c068ae9cc5db4e8 && this._(t) : void 0 !== t._$litType$ ? this.g(t) : void 0 !== t.nodeType ? this.$(t) : $1cb21db0eb1a0be5$var$v(t) ? this.T(t) : this._(t);
    }
    k(t) {
        return this._$AA.parentNode.insertBefore(t, this._$AB);
    }
    $(t) {
        this._$AH !== t && (this._$AR(), this._$AH = this.k(t));
    }
    _(t) {
        this._$AH !== $1cb21db0eb1a0be5$export$45b790e32b2810ee && $1cb21db0eb1a0be5$var$d(this._$AH) ? this._$AA.nextSibling.data = t : this.$($1cb21db0eb1a0be5$var$r.createTextNode(t)), this._$AH = t;
    }
    g(t) {
        var i;
        const { values: s, _$litType$: e } = t, o = "number" == typeof e ? this._$AC(t) : (void 0 === e.el && (e.el = $1cb21db0eb1a0be5$var$N.createElement($1cb21db0eb1a0be5$var$P(e.h, e.h[0]), this.options)), e);
        if ((null === (i = this._$AH) || void 0 === i ? void 0 : i._$AD) === o) this._$AH.v(s);
        else {
            const t = new $1cb21db0eb1a0be5$var$M(o, this), i = t.u(this.options);
            t.v(s), this.$(i), this._$AH = t;
        }
    }
    _$AC(t) {
        let i = $1cb21db0eb1a0be5$var$E.get(t.strings);
        return void 0 === i && $1cb21db0eb1a0be5$var$E.set(t.strings, i = new $1cb21db0eb1a0be5$var$N(t)), i;
    }
    T(t) {
        $1cb21db0eb1a0be5$var$c(this._$AH) || (this._$AH = [], this._$AR());
        const i = this._$AH;
        let s, e = 0;
        for (const o of t)e === i.length ? i.push(s = new $1cb21db0eb1a0be5$var$R(this.k($1cb21db0eb1a0be5$var$u()), this.k($1cb21db0eb1a0be5$var$u()), this, this.options)) : s = i[e], s._$AI(o), e++;
        e < i.length && (this._$AR(s && s._$AB.nextSibling, e), i.length = e);
    }
    _$AR(t = this._$AA.nextSibling, i) {
        var s;
        for(null === (s = this._$AP) || void 0 === s || s.call(this, !1, !0, i); t && t !== this._$AB;){
            const i = t.nextSibling;
            t.remove(), t = i;
        }
    }
    setConnected(t) {
        var i;
        void 0 === this._$AM && (this._$Cp = t, null === (i = this._$AP) || void 0 === i || i.call(this, t));
    }
}
class $1cb21db0eb1a0be5$var$k {
    constructor(t, i, s, e, o){
        this.type = 1, this._$AH = $1cb21db0eb1a0be5$export$45b790e32b2810ee, this._$AN = void 0, this.element = t, this.name = i, this._$AM = e, this.options = o, s.length > 2 || "" !== s[0] || "" !== s[1] ? (this._$AH = Array(s.length - 1).fill(new String), this.strings = s) : this._$AH = $1cb21db0eb1a0be5$export$45b790e32b2810ee;
    }
    get tagName() {
        return this.element.tagName;
    }
    get _$AU() {
        return this._$AM._$AU;
    }
    _$AI(t, i = this, s, e) {
        const o = this.strings;
        let n = !1;
        if (void 0 === o) t = $1cb21db0eb1a0be5$var$S(this, t, i, 0), n = !$1cb21db0eb1a0be5$var$d(t) || t !== this._$AH && t !== $1cb21db0eb1a0be5$export$9c068ae9cc5db4e8, n && (this._$AH = t);
        else {
            const e = t;
            let l, h;
            for(t = o[0], l = 0; l < o.length - 1; l++)h = $1cb21db0eb1a0be5$var$S(this, e[s + l], i, l), h === $1cb21db0eb1a0be5$export$9c068ae9cc5db4e8 && (h = this._$AH[l]), n || (n = !$1cb21db0eb1a0be5$var$d(h) || h !== this._$AH[l]), h === $1cb21db0eb1a0be5$export$45b790e32b2810ee ? t = $1cb21db0eb1a0be5$export$45b790e32b2810ee : t !== $1cb21db0eb1a0be5$export$45b790e32b2810ee && (t += (null != h ? h : "") + o[l + 1]), this._$AH[l] = h;
        }
        n && !e && this.j(t);
    }
    j(t) {
        t === $1cb21db0eb1a0be5$export$45b790e32b2810ee ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, null != t ? t : "");
    }
}
class $1cb21db0eb1a0be5$var$H extends $1cb21db0eb1a0be5$var$k {
    constructor(){
        super(...arguments), this.type = 3;
    }
    j(t) {
        this.element[this.name] = t === $1cb21db0eb1a0be5$export$45b790e32b2810ee ? void 0 : t;
    }
}
const $1cb21db0eb1a0be5$var$I = $1cb21db0eb1a0be5$var$s ? $1cb21db0eb1a0be5$var$s.emptyScript : "";
class $1cb21db0eb1a0be5$var$L extends $1cb21db0eb1a0be5$var$k {
    constructor(){
        super(...arguments), this.type = 4;
    }
    j(t) {
        t && t !== $1cb21db0eb1a0be5$export$45b790e32b2810ee ? this.element.setAttribute(this.name, $1cb21db0eb1a0be5$var$I) : this.element.removeAttribute(this.name);
    }
}
class $1cb21db0eb1a0be5$var$z extends $1cb21db0eb1a0be5$var$k {
    constructor(t, i, s, e, o){
        super(t, i, s, e, o), this.type = 5;
    }
    _$AI(t, i = this) {
        var s;
        if ((t = null !== (s = $1cb21db0eb1a0be5$var$S(this, t, i, 0)) && void 0 !== s ? s : $1cb21db0eb1a0be5$export$45b790e32b2810ee) === $1cb21db0eb1a0be5$export$9c068ae9cc5db4e8) return;
        const e = this._$AH, o = t === $1cb21db0eb1a0be5$export$45b790e32b2810ee && e !== $1cb21db0eb1a0be5$export$45b790e32b2810ee || t.capture !== e.capture || t.once !== e.once || t.passive !== e.passive, n = t !== $1cb21db0eb1a0be5$export$45b790e32b2810ee && (e === $1cb21db0eb1a0be5$export$45b790e32b2810ee || o);
        o && this.element.removeEventListener(this.name, this, e), n && this.element.addEventListener(this.name, this, t), this._$AH = t;
    }
    handleEvent(t) {
        var i, s;
        "function" == typeof this._$AH ? this._$AH.call(null !== (s = null === (i = this.options) || void 0 === i ? void 0 : i.host) && void 0 !== s ? s : this.element, t) : this._$AH.handleEvent(t);
    }
}
class $1cb21db0eb1a0be5$var$Z {
    constructor(t, i, s){
        this.element = t, this.type = 6, this._$AN = void 0, this._$AM = i, this.options = s;
    }
    get _$AU() {
        return this._$AM._$AU;
    }
    _$AI(t) {
        $1cb21db0eb1a0be5$var$S(this, t);
    }
}
const $1cb21db0eb1a0be5$export$8613d1ca9052b22e = {
    O: $1cb21db0eb1a0be5$var$o,
    P: $1cb21db0eb1a0be5$var$n,
    A: $1cb21db0eb1a0be5$var$l,
    C: 1,
    M: $1cb21db0eb1a0be5$var$V,
    L: $1cb21db0eb1a0be5$var$M,
    R: $1cb21db0eb1a0be5$var$v,
    D: $1cb21db0eb1a0be5$var$S,
    I: $1cb21db0eb1a0be5$var$R,
    V: $1cb21db0eb1a0be5$var$k,
    H: $1cb21db0eb1a0be5$var$L,
    N: $1cb21db0eb1a0be5$var$z,
    U: $1cb21db0eb1a0be5$var$H,
    F: $1cb21db0eb1a0be5$var$Z
}, $1cb21db0eb1a0be5$var$B = $1cb21db0eb1a0be5$var$i.litHtmlPolyfillSupport;
null == $1cb21db0eb1a0be5$var$B || $1cb21db0eb1a0be5$var$B($1cb21db0eb1a0be5$var$N, $1cb21db0eb1a0be5$var$R), (null !== ($1cb21db0eb1a0be5$var$t = $1cb21db0eb1a0be5$var$i.litHtmlVersions) && void 0 !== $1cb21db0eb1a0be5$var$t ? $1cb21db0eb1a0be5$var$t : $1cb21db0eb1a0be5$var$i.litHtmlVersions = []).push("2.8.0");
const $1cb21db0eb1a0be5$export$b3890eb0ae9dca99 = (t, i, s)=>{
    var e, o;
    const n = null !== (e = null == s ? void 0 : s.renderBefore) && void 0 !== e ? e : i;
    let l = n._$litPart$;
    if (void 0 === l) {
        const t = null !== (o = null == s ? void 0 : s.renderBefore) && void 0 !== o ? o : null;
        n._$litPart$ = l = new $1cb21db0eb1a0be5$var$R(i.insertBefore($1cb21db0eb1a0be5$var$u(), t), t, void 0, null != s ? s : {});
    }
    return l._$AI(t), l;
};


/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */ const $b79cab361f081c93$var$t = window, $b79cab361f081c93$export$b4d10f6001c083c2 = $b79cab361f081c93$var$t.ShadowRoot && (void 0 === $b79cab361f081c93$var$t.ShadyCSS || $b79cab361f081c93$var$t.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, $b79cab361f081c93$var$s = Symbol(), $b79cab361f081c93$var$n = new WeakMap;
class $b79cab361f081c93$export$505d1e8739bad805 {
    constructor(t, e, n){
        if (this._$cssResult$ = !0, n !== $b79cab361f081c93$var$s) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
        this.cssText = t, this.t = e;
    }
    get styleSheet() {
        let t = this.o;
        const s = this.t;
        if ($b79cab361f081c93$export$b4d10f6001c083c2 && void 0 === t) {
            const e = void 0 !== s && 1 === s.length;
            e && (t = $b79cab361f081c93$var$n.get(s)), void 0 === t && ((this.o = t = new CSSStyleSheet).replaceSync(this.cssText), e && $b79cab361f081c93$var$n.set(s, t));
        }
        return t;
    }
    toString() {
        return this.cssText;
    }
}
const $b79cab361f081c93$export$8d80f9cac07cdb3 = (t)=>new $b79cab361f081c93$export$505d1e8739bad805("string" == typeof t ? t : t + "", void 0, $b79cab361f081c93$var$s), $b79cab361f081c93$export$dbf350e5966cf602 = (t, ...e)=>{
    const n = 1 === t.length ? t[0] : e.reduce((e, s, n)=>e + ((t)=>{
            if (!0 === t._$cssResult$) return t.cssText;
            if ("number" == typeof t) return t;
            throw Error("Value passed to 'css' function must be a 'css' function result: " + t + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
        })(s) + t[n + 1], t[0]);
    return new $b79cab361f081c93$export$505d1e8739bad805(n, t, $b79cab361f081c93$var$s);
}, $b79cab361f081c93$export$2ca4a66ec4cecb90 = (s, n)=>{
    $b79cab361f081c93$export$b4d10f6001c083c2 ? s.adoptedStyleSheets = n.map((t)=>t instanceof CSSStyleSheet ? t : t.styleSheet) : n.forEach((e)=>{
        const n = document.createElement("style"), o = $b79cab361f081c93$var$t.litNonce;
        void 0 !== o && n.setAttribute("nonce", o), n.textContent = e.cssText, s.appendChild(n);
    });
}, $b79cab361f081c93$export$ee69dfd951e24778 = $b79cab361f081c93$export$b4d10f6001c083c2 ? (t)=>t : (t)=>t instanceof CSSStyleSheet ? ((t)=>{
        let e = "";
        for (const s of t.cssRules)e += s.cssText;
        return $b79cab361f081c93$export$8d80f9cac07cdb3(e);
    })(t) : t;


/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */ var $e620ef0d8bdd6ef5$var$s;
const $e620ef0d8bdd6ef5$var$e = window, $e620ef0d8bdd6ef5$var$r = $e620ef0d8bdd6ef5$var$e.trustedTypes, $e620ef0d8bdd6ef5$var$h = $e620ef0d8bdd6ef5$var$r ? $e620ef0d8bdd6ef5$var$r.emptyScript : "", $e620ef0d8bdd6ef5$var$o = $e620ef0d8bdd6ef5$var$e.reactiveElementPolyfillSupport, $e620ef0d8bdd6ef5$export$7312b35fbf521afb = {
    toAttribute (t, i) {
        switch(i){
            case Boolean:
                t = t ? $e620ef0d8bdd6ef5$var$h : null;
                break;
            case Object:
            case Array:
                t = null == t ? t : JSON.stringify(t);
        }
        return t;
    },
    fromAttribute (t, i) {
        let s = t;
        switch(i){
            case Boolean:
                s = null !== t;
                break;
            case Number:
                s = null === t ? null : Number(t);
                break;
            case Object:
            case Array:
                try {
                    s = JSON.parse(t);
                } catch (t) {
                    s = null;
                }
        }
        return s;
    }
}, $e620ef0d8bdd6ef5$export$53a6892c50694894 = (t, i)=>i !== t && (i == i || t == t), $e620ef0d8bdd6ef5$var$l = {
    attribute: !0,
    type: String,
    converter: $e620ef0d8bdd6ef5$export$7312b35fbf521afb,
    reflect: !1,
    hasChanged: $e620ef0d8bdd6ef5$export$53a6892c50694894
}, $e620ef0d8bdd6ef5$var$d = "finalized";
class $e620ef0d8bdd6ef5$export$c7c07a37856565d extends HTMLElement {
    constructor(){
        super(), this._$Ei = new Map, this.isUpdatePending = !1, this.hasUpdated = !1, this._$El = null, this._$Eu();
    }
    static addInitializer(t) {
        var i;
        this.finalize(), (null !== (i = this.h) && void 0 !== i ? i : this.h = []).push(t);
    }
    static get observedAttributes() {
        this.finalize();
        const t = [];
        return this.elementProperties.forEach((i, s)=>{
            const e = this._$Ep(s, i);
            void 0 !== e && (this._$Ev.set(e, s), t.push(e));
        }), t;
    }
    static createProperty(t, i = $e620ef0d8bdd6ef5$var$l) {
        if (i.state && (i.attribute = !1), this.finalize(), this.elementProperties.set(t, i), !i.noAccessor && !this.prototype.hasOwnProperty(t)) {
            const s = "symbol" == typeof t ? Symbol() : "__" + t, e = this.getPropertyDescriptor(t, s, i);
            void 0 !== e && Object.defineProperty(this.prototype, t, e);
        }
    }
    static getPropertyDescriptor(t, i, s) {
        return {
            get () {
                return this[i];
            },
            set (e) {
                const r = this[t];
                this[i] = e, this.requestUpdate(t, r, s);
            },
            configurable: !0,
            enumerable: !0
        };
    }
    static getPropertyOptions(t) {
        return this.elementProperties.get(t) || $e620ef0d8bdd6ef5$var$l;
    }
    static finalize() {
        if (this.hasOwnProperty($e620ef0d8bdd6ef5$var$d)) return !1;
        this[$e620ef0d8bdd6ef5$var$d] = !0;
        const t = Object.getPrototypeOf(this);
        if (t.finalize(), void 0 !== t.h && (this.h = [
            ...t.h
        ]), this.elementProperties = new Map(t.elementProperties), this._$Ev = new Map, this.hasOwnProperty("properties")) {
            const t = this.properties, i = [
                ...Object.getOwnPropertyNames(t),
                ...Object.getOwnPropertySymbols(t)
            ];
            for (const s of i)this.createProperty(s, t[s]);
        }
        return this.elementStyles = this.finalizeStyles(this.styles), !0;
    }
    static finalizeStyles(i) {
        const s = [];
        if (Array.isArray(i)) {
            const e = new Set(i.flat(1 / 0).reverse());
            for (const i of e)s.unshift((0, $b79cab361f081c93$export$ee69dfd951e24778)(i));
        } else void 0 !== i && s.push((0, $b79cab361f081c93$export$ee69dfd951e24778)(i));
        return s;
    }
    static _$Ep(t, i) {
        const s = i.attribute;
        return !1 === s ? void 0 : "string" == typeof s ? s : "string" == typeof t ? t.toLowerCase() : void 0;
    }
    _$Eu() {
        var t;
        this._$E_ = new Promise((t)=>this.enableUpdating = t), this._$AL = new Map, this._$Eg(), this.requestUpdate(), null === (t = this.constructor.h) || void 0 === t || t.forEach((t)=>t(this));
    }
    addController(t) {
        var i, s;
        (null !== (i = this._$ES) && void 0 !== i ? i : this._$ES = []).push(t), void 0 !== this.renderRoot && this.isConnected && (null === (s = t.hostConnected) || void 0 === s || s.call(t));
    }
    removeController(t) {
        var i;
        null === (i = this._$ES) || void 0 === i || i.splice(this._$ES.indexOf(t) >>> 0, 1);
    }
    _$Eg() {
        this.constructor.elementProperties.forEach((t, i)=>{
            this.hasOwnProperty(i) && (this._$Ei.set(i, this[i]), delete this[i]);
        });
    }
    createRenderRoot() {
        var t;
        const s = null !== (t = this.shadowRoot) && void 0 !== t ? t : this.attachShadow(this.constructor.shadowRootOptions);
        return (0, $b79cab361f081c93$export$2ca4a66ec4cecb90)(s, this.constructor.elementStyles), s;
    }
    connectedCallback() {
        var t;
        void 0 === this.renderRoot && (this.renderRoot = this.createRenderRoot()), this.enableUpdating(!0), null === (t = this._$ES) || void 0 === t || t.forEach((t)=>{
            var i;
            return null === (i = t.hostConnected) || void 0 === i ? void 0 : i.call(t);
        });
    }
    enableUpdating(t) {}
    disconnectedCallback() {
        var t;
        null === (t = this._$ES) || void 0 === t || t.forEach((t)=>{
            var i;
            return null === (i = t.hostDisconnected) || void 0 === i ? void 0 : i.call(t);
        });
    }
    attributeChangedCallback(t, i, s) {
        this._$AK(t, s);
    }
    _$EO(t, i, s = $e620ef0d8bdd6ef5$var$l) {
        var e;
        const r = this.constructor._$Ep(t, s);
        if (void 0 !== r && !0 === s.reflect) {
            const h = (void 0 !== (null === (e = s.converter) || void 0 === e ? void 0 : e.toAttribute) ? s.converter : $e620ef0d8bdd6ef5$export$7312b35fbf521afb).toAttribute(i, s.type);
            this._$El = t, null == h ? this.removeAttribute(r) : this.setAttribute(r, h), this._$El = null;
        }
    }
    _$AK(t, i) {
        var s;
        const e = this.constructor, r = e._$Ev.get(t);
        if (void 0 !== r && this._$El !== r) {
            const t = e.getPropertyOptions(r), h = "function" == typeof t.converter ? {
                fromAttribute: t.converter
            } : void 0 !== (null === (s = t.converter) || void 0 === s ? void 0 : s.fromAttribute) ? t.converter : $e620ef0d8bdd6ef5$export$7312b35fbf521afb;
            this._$El = r, this[r] = h.fromAttribute(i, t.type), this._$El = null;
        }
    }
    requestUpdate(t, i, s) {
        let e = !0;
        void 0 !== t && (((s = s || this.constructor.getPropertyOptions(t)).hasChanged || $e620ef0d8bdd6ef5$export$53a6892c50694894)(this[t], i) ? (this._$AL.has(t) || this._$AL.set(t, i), !0 === s.reflect && this._$El !== t && (void 0 === this._$EC && (this._$EC = new Map), this._$EC.set(t, s))) : e = !1), !this.isUpdatePending && e && (this._$E_ = this._$Ej());
    }
    async _$Ej() {
        this.isUpdatePending = !0;
        try {
            await this._$E_;
        } catch (t) {
            Promise.reject(t);
        }
        const t = this.scheduleUpdate();
        return null != t && await t, !this.isUpdatePending;
    }
    scheduleUpdate() {
        return this.performUpdate();
    }
    performUpdate() {
        var t;
        if (!this.isUpdatePending) return;
        this.hasUpdated, this._$Ei && (this._$Ei.forEach((t, i)=>this[i] = t), this._$Ei = void 0);
        let i = !1;
        const s = this._$AL;
        try {
            i = this.shouldUpdate(s), i ? (this.willUpdate(s), null === (t = this._$ES) || void 0 === t || t.forEach((t)=>{
                var i;
                return null === (i = t.hostUpdate) || void 0 === i ? void 0 : i.call(t);
            }), this.update(s)) : this._$Ek();
        } catch (t) {
            throw i = !1, this._$Ek(), t;
        }
        i && this._$AE(s);
    }
    willUpdate(t) {}
    _$AE(t) {
        var i;
        null === (i = this._$ES) || void 0 === i || i.forEach((t)=>{
            var i;
            return null === (i = t.hostUpdated) || void 0 === i ? void 0 : i.call(t);
        }), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(t)), this.updated(t);
    }
    _$Ek() {
        this._$AL = new Map, this.isUpdatePending = !1;
    }
    get updateComplete() {
        return this.getUpdateComplete();
    }
    getUpdateComplete() {
        return this._$E_;
    }
    shouldUpdate(t) {
        return !0;
    }
    update(t) {
        void 0 !== this._$EC && (this._$EC.forEach((t, i)=>this._$EO(i, this[i], t)), this._$EC = void 0), this._$Ek();
    }
    updated(t) {}
    firstUpdated(t) {}
}
$e620ef0d8bdd6ef5$export$c7c07a37856565d[$e620ef0d8bdd6ef5$var$d] = !0, $e620ef0d8bdd6ef5$export$c7c07a37856565d.elementProperties = new Map, $e620ef0d8bdd6ef5$export$c7c07a37856565d.elementStyles = [], $e620ef0d8bdd6ef5$export$c7c07a37856565d.shadowRootOptions = {
    mode: "open"
}, null == $e620ef0d8bdd6ef5$var$o || $e620ef0d8bdd6ef5$var$o({
    ReactiveElement: $e620ef0d8bdd6ef5$export$c7c07a37856565d
}), (null !== ($e620ef0d8bdd6ef5$var$s = $e620ef0d8bdd6ef5$var$e.reactiveElementVersions) && void 0 !== $e620ef0d8bdd6ef5$var$s ? $e620ef0d8bdd6ef5$var$s : $e620ef0d8bdd6ef5$var$e.reactiveElementVersions = []).push("1.6.3");


/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */ var $f156c5f18ecaaf3f$var$t;
const $f156c5f18ecaaf3f$var$i = window, $f156c5f18ecaaf3f$var$s = $f156c5f18ecaaf3f$var$i.trustedTypes, $f156c5f18ecaaf3f$var$e = $f156c5f18ecaaf3f$var$s ? $f156c5f18ecaaf3f$var$s.createPolicy("lit-html", {
    createHTML: (t)=>t
}) : void 0, $f156c5f18ecaaf3f$var$o = "$lit$", $f156c5f18ecaaf3f$var$n = `lit$${(Math.random() + "").slice(9)}$`, $f156c5f18ecaaf3f$var$l = "?" + $f156c5f18ecaaf3f$var$n, $f156c5f18ecaaf3f$var$h = `<${$f156c5f18ecaaf3f$var$l}>`, $f156c5f18ecaaf3f$var$r = document, $f156c5f18ecaaf3f$var$u = ()=>$f156c5f18ecaaf3f$var$r.createComment(""), $f156c5f18ecaaf3f$var$d = (t)=>null === t || "object" != typeof t && "function" != typeof t, $f156c5f18ecaaf3f$var$c = Array.isArray, $f156c5f18ecaaf3f$var$v = (t)=>$f156c5f18ecaaf3f$var$c(t) || "function" == typeof (null == t ? void 0 : t[Symbol.iterator]), $f156c5f18ecaaf3f$var$a = "[ \t\n\f\r]", $f156c5f18ecaaf3f$var$f = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, $f156c5f18ecaaf3f$var$_ = /-->/g, $f156c5f18ecaaf3f$var$m = />/g, $f156c5f18ecaaf3f$var$p = RegExp(`>|${$f156c5f18ecaaf3f$var$a}(?:([^\\s"'>=/]+)(${$f156c5f18ecaaf3f$var$a}*=${$f156c5f18ecaaf3f$var$a}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`, "g"), $f156c5f18ecaaf3f$var$g = /'/g, $f156c5f18ecaaf3f$var$$ = /"/g, $f156c5f18ecaaf3f$var$y = /^(?:script|style|textarea|title)$/i, $f156c5f18ecaaf3f$var$w = (t)=>(i, ...s)=>({
            _$litType$: t,
            strings: i,
            values: s
        }), $f156c5f18ecaaf3f$export$c0bb0b647f701bb5 = $f156c5f18ecaaf3f$var$w(1), $f156c5f18ecaaf3f$export$7ed1367e7fa1ad68 = $f156c5f18ecaaf3f$var$w(2), $f156c5f18ecaaf3f$export$9c068ae9cc5db4e8 = Symbol.for("lit-noChange"), $f156c5f18ecaaf3f$export$45b790e32b2810ee = Symbol.for("lit-nothing"), $f156c5f18ecaaf3f$var$E = new WeakMap, $f156c5f18ecaaf3f$var$C = $f156c5f18ecaaf3f$var$r.createTreeWalker($f156c5f18ecaaf3f$var$r, 129, null, !1);
function $f156c5f18ecaaf3f$var$P(t, i) {
    if (!Array.isArray(t) || !t.hasOwnProperty("raw")) throw Error("invalid template strings array");
    return void 0 !== $f156c5f18ecaaf3f$var$e ? $f156c5f18ecaaf3f$var$e.createHTML(i) : i;
}
const $f156c5f18ecaaf3f$var$V = (t, i)=>{
    const s = t.length - 1, e = [];
    let l, r = 2 === i ? "<svg>" : "", u = $f156c5f18ecaaf3f$var$f;
    for(let i = 0; i < s; i++){
        const s = t[i];
        let d, c, v = -1, a = 0;
        for(; a < s.length && (u.lastIndex = a, c = u.exec(s), null !== c);)a = u.lastIndex, u === $f156c5f18ecaaf3f$var$f ? "!--" === c[1] ? u = $f156c5f18ecaaf3f$var$_ : void 0 !== c[1] ? u = $f156c5f18ecaaf3f$var$m : void 0 !== c[2] ? ($f156c5f18ecaaf3f$var$y.test(c[2]) && (l = RegExp("</" + c[2], "g")), u = $f156c5f18ecaaf3f$var$p) : void 0 !== c[3] && (u = $f156c5f18ecaaf3f$var$p) : u === $f156c5f18ecaaf3f$var$p ? ">" === c[0] ? (u = null != l ? l : $f156c5f18ecaaf3f$var$f, v = -1) : void 0 === c[1] ? v = -2 : (v = u.lastIndex - c[2].length, d = c[1], u = void 0 === c[3] ? $f156c5f18ecaaf3f$var$p : '"' === c[3] ? $f156c5f18ecaaf3f$var$$ : $f156c5f18ecaaf3f$var$g) : u === $f156c5f18ecaaf3f$var$$ || u === $f156c5f18ecaaf3f$var$g ? u = $f156c5f18ecaaf3f$var$p : u === $f156c5f18ecaaf3f$var$_ || u === $f156c5f18ecaaf3f$var$m ? u = $f156c5f18ecaaf3f$var$f : (u = $f156c5f18ecaaf3f$var$p, l = void 0);
        const w = u === $f156c5f18ecaaf3f$var$p && t[i + 1].startsWith("/>") ? " " : "";
        r += u === $f156c5f18ecaaf3f$var$f ? s + $f156c5f18ecaaf3f$var$h : v >= 0 ? (e.push(d), s.slice(0, v) + $f156c5f18ecaaf3f$var$o + s.slice(v) + $f156c5f18ecaaf3f$var$n + w) : s + $f156c5f18ecaaf3f$var$n + (-2 === v ? (e.push(void 0), i) : w);
    }
    return [
        $f156c5f18ecaaf3f$var$P(t, r + (t[s] || "<?>") + (2 === i ? "</svg>" : "")),
        e
    ];
};
class $f156c5f18ecaaf3f$var$N {
    constructor({ strings: t, _$litType$: i }, e){
        let h;
        this.parts = [];
        let r = 0, d = 0;
        const c = t.length - 1, v = this.parts, [a, f] = $f156c5f18ecaaf3f$var$V(t, i);
        if (this.el = $f156c5f18ecaaf3f$var$N.createElement(a, e), $f156c5f18ecaaf3f$var$C.currentNode = this.el.content, 2 === i) {
            const t = this.el.content, i = t.firstChild;
            i.remove(), t.append(...i.childNodes);
        }
        for(; null !== (h = $f156c5f18ecaaf3f$var$C.nextNode()) && v.length < c;){
            if (1 === h.nodeType) {
                if (h.hasAttributes()) {
                    const t = [];
                    for (const i of h.getAttributeNames())if (i.endsWith($f156c5f18ecaaf3f$var$o) || i.startsWith($f156c5f18ecaaf3f$var$n)) {
                        const s = f[d++];
                        if (t.push(i), void 0 !== s) {
                            const t = h.getAttribute(s.toLowerCase() + $f156c5f18ecaaf3f$var$o).split($f156c5f18ecaaf3f$var$n), i = /([.?@])?(.*)/.exec(s);
                            v.push({
                                type: 1,
                                index: r,
                                name: i[2],
                                strings: t,
                                ctor: "." === i[1] ? $f156c5f18ecaaf3f$var$H : "?" === i[1] ? $f156c5f18ecaaf3f$var$L : "@" === i[1] ? $f156c5f18ecaaf3f$var$z : $f156c5f18ecaaf3f$var$k
                            });
                        } else v.push({
                            type: 6,
                            index: r
                        });
                    }
                    for (const i of t)h.removeAttribute(i);
                }
                if ($f156c5f18ecaaf3f$var$y.test(h.tagName)) {
                    const t = h.textContent.split($f156c5f18ecaaf3f$var$n), i = t.length - 1;
                    if (i > 0) {
                        h.textContent = $f156c5f18ecaaf3f$var$s ? $f156c5f18ecaaf3f$var$s.emptyScript : "";
                        for(let s = 0; s < i; s++)h.append(t[s], $f156c5f18ecaaf3f$var$u()), $f156c5f18ecaaf3f$var$C.nextNode(), v.push({
                            type: 2,
                            index: ++r
                        });
                        h.append(t[i], $f156c5f18ecaaf3f$var$u());
                    }
                }
            } else if (8 === h.nodeType) {
                if (h.data === $f156c5f18ecaaf3f$var$l) v.push({
                    type: 2,
                    index: r
                });
                else {
                    let t = -1;
                    for(; -1 !== (t = h.data.indexOf($f156c5f18ecaaf3f$var$n, t + 1));)v.push({
                        type: 7,
                        index: r
                    }), t += $f156c5f18ecaaf3f$var$n.length - 1;
                }
            }
            r++;
        }
    }
    static createElement(t, i) {
        const s = $f156c5f18ecaaf3f$var$r.createElement("template");
        return s.innerHTML = t, s;
    }
}
function $f156c5f18ecaaf3f$var$S(t, i, s = t, e) {
    var o, n, l, h;
    if (i === $f156c5f18ecaaf3f$export$9c068ae9cc5db4e8) return i;
    let r = void 0 !== e ? null === (o = s._$Co) || void 0 === o ? void 0 : o[e] : s._$Cl;
    const u = $f156c5f18ecaaf3f$var$d(i) ? void 0 : i._$litDirective$;
    return (null == r ? void 0 : r.constructor) !== u && (null === (n = null == r ? void 0 : r._$AO) || void 0 === n || n.call(r, !1), void 0 === u ? r = void 0 : (r = new u(t), r._$AT(t, s, e)), void 0 !== e ? (null !== (l = (h = s)._$Co) && void 0 !== l ? l : h._$Co = [])[e] = r : s._$Cl = r), void 0 !== r && (i = $f156c5f18ecaaf3f$var$S(t, r._$AS(t, i.values), r, e)), i;
}
class $f156c5f18ecaaf3f$var$M {
    constructor(t, i){
        this._$AV = [], this._$AN = void 0, this._$AD = t, this._$AM = i;
    }
    get parentNode() {
        return this._$AM.parentNode;
    }
    get _$AU() {
        return this._$AM._$AU;
    }
    u(t) {
        var i;
        const { el: { content: s }, parts: e } = this._$AD, o = (null !== (i = null == t ? void 0 : t.creationScope) && void 0 !== i ? i : $f156c5f18ecaaf3f$var$r).importNode(s, !0);
        $f156c5f18ecaaf3f$var$C.currentNode = o;
        let n = $f156c5f18ecaaf3f$var$C.nextNode(), l = 0, h = 0, u = e[0];
        for(; void 0 !== u;){
            if (l === u.index) {
                let i;
                2 === u.type ? i = new $f156c5f18ecaaf3f$var$R(n, n.nextSibling, this, t) : 1 === u.type ? i = new u.ctor(n, u.name, u.strings, this, t) : 6 === u.type && (i = new $f156c5f18ecaaf3f$var$Z(n, this, t)), this._$AV.push(i), u = e[++h];
            }
            l !== (null == u ? void 0 : u.index) && (n = $f156c5f18ecaaf3f$var$C.nextNode(), l++);
        }
        return $f156c5f18ecaaf3f$var$C.currentNode = $f156c5f18ecaaf3f$var$r, o;
    }
    v(t) {
        let i = 0;
        for (const s of this._$AV)void 0 !== s && (void 0 !== s.strings ? (s._$AI(t, s, i), i += s.strings.length - 2) : s._$AI(t[i])), i++;
    }
}
class $f156c5f18ecaaf3f$var$R {
    constructor(t, i, s, e){
        var o;
        this.type = 2, this._$AH = $f156c5f18ecaaf3f$export$45b790e32b2810ee, this._$AN = void 0, this._$AA = t, this._$AB = i, this._$AM = s, this.options = e, this._$Cp = null === (o = null == e ? void 0 : e.isConnected) || void 0 === o || o;
    }
    get _$AU() {
        var t, i;
        return null !== (i = null === (t = this._$AM) || void 0 === t ? void 0 : t._$AU) && void 0 !== i ? i : this._$Cp;
    }
    get parentNode() {
        let t = this._$AA.parentNode;
        const i = this._$AM;
        return void 0 !== i && 11 === (null == t ? void 0 : t.nodeType) && (t = i.parentNode), t;
    }
    get startNode() {
        return this._$AA;
    }
    get endNode() {
        return this._$AB;
    }
    _$AI(t, i = this) {
        t = $f156c5f18ecaaf3f$var$S(this, t, i), $f156c5f18ecaaf3f$var$d(t) ? t === $f156c5f18ecaaf3f$export$45b790e32b2810ee || null == t || "" === t ? (this._$AH !== $f156c5f18ecaaf3f$export$45b790e32b2810ee && this._$AR(), this._$AH = $f156c5f18ecaaf3f$export$45b790e32b2810ee) : t !== this._$AH && t !== $f156c5f18ecaaf3f$export$9c068ae9cc5db4e8 && this._(t) : void 0 !== t._$litType$ ? this.g(t) : void 0 !== t.nodeType ? this.$(t) : $f156c5f18ecaaf3f$var$v(t) ? this.T(t) : this._(t);
    }
    k(t) {
        return this._$AA.parentNode.insertBefore(t, this._$AB);
    }
    $(t) {
        this._$AH !== t && (this._$AR(), this._$AH = this.k(t));
    }
    _(t) {
        this._$AH !== $f156c5f18ecaaf3f$export$45b790e32b2810ee && $f156c5f18ecaaf3f$var$d(this._$AH) ? this._$AA.nextSibling.data = t : this.$($f156c5f18ecaaf3f$var$r.createTextNode(t)), this._$AH = t;
    }
    g(t) {
        var i;
        const { values: s, _$litType$: e } = t, o = "number" == typeof e ? this._$AC(t) : (void 0 === e.el && (e.el = $f156c5f18ecaaf3f$var$N.createElement($f156c5f18ecaaf3f$var$P(e.h, e.h[0]), this.options)), e);
        if ((null === (i = this._$AH) || void 0 === i ? void 0 : i._$AD) === o) this._$AH.v(s);
        else {
            const t = new $f156c5f18ecaaf3f$var$M(o, this), i = t.u(this.options);
            t.v(s), this.$(i), this._$AH = t;
        }
    }
    _$AC(t) {
        let i = $f156c5f18ecaaf3f$var$E.get(t.strings);
        return void 0 === i && $f156c5f18ecaaf3f$var$E.set(t.strings, i = new $f156c5f18ecaaf3f$var$N(t)), i;
    }
    T(t) {
        $f156c5f18ecaaf3f$var$c(this._$AH) || (this._$AH = [], this._$AR());
        const i = this._$AH;
        let s, e = 0;
        for (const o of t)e === i.length ? i.push(s = new $f156c5f18ecaaf3f$var$R(this.k($f156c5f18ecaaf3f$var$u()), this.k($f156c5f18ecaaf3f$var$u()), this, this.options)) : s = i[e], s._$AI(o), e++;
        e < i.length && (this._$AR(s && s._$AB.nextSibling, e), i.length = e);
    }
    _$AR(t = this._$AA.nextSibling, i) {
        var s;
        for(null === (s = this._$AP) || void 0 === s || s.call(this, !1, !0, i); t && t !== this._$AB;){
            const i = t.nextSibling;
            t.remove(), t = i;
        }
    }
    setConnected(t) {
        var i;
        void 0 === this._$AM && (this._$Cp = t, null === (i = this._$AP) || void 0 === i || i.call(this, t));
    }
}
class $f156c5f18ecaaf3f$var$k {
    constructor(t, i, s, e, o){
        this.type = 1, this._$AH = $f156c5f18ecaaf3f$export$45b790e32b2810ee, this._$AN = void 0, this.element = t, this.name = i, this._$AM = e, this.options = o, s.length > 2 || "" !== s[0] || "" !== s[1] ? (this._$AH = Array(s.length - 1).fill(new String), this.strings = s) : this._$AH = $f156c5f18ecaaf3f$export$45b790e32b2810ee;
    }
    get tagName() {
        return this.element.tagName;
    }
    get _$AU() {
        return this._$AM._$AU;
    }
    _$AI(t, i = this, s, e) {
        const o = this.strings;
        let n = !1;
        if (void 0 === o) t = $f156c5f18ecaaf3f$var$S(this, t, i, 0), n = !$f156c5f18ecaaf3f$var$d(t) || t !== this._$AH && t !== $f156c5f18ecaaf3f$export$9c068ae9cc5db4e8, n && (this._$AH = t);
        else {
            const e = t;
            let l, h;
            for(t = o[0], l = 0; l < o.length - 1; l++)h = $f156c5f18ecaaf3f$var$S(this, e[s + l], i, l), h === $f156c5f18ecaaf3f$export$9c068ae9cc5db4e8 && (h = this._$AH[l]), n || (n = !$f156c5f18ecaaf3f$var$d(h) || h !== this._$AH[l]), h === $f156c5f18ecaaf3f$export$45b790e32b2810ee ? t = $f156c5f18ecaaf3f$export$45b790e32b2810ee : t !== $f156c5f18ecaaf3f$export$45b790e32b2810ee && (t += (null != h ? h : "") + o[l + 1]), this._$AH[l] = h;
        }
        n && !e && this.j(t);
    }
    j(t) {
        t === $f156c5f18ecaaf3f$export$45b790e32b2810ee ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, null != t ? t : "");
    }
}
class $f156c5f18ecaaf3f$var$H extends $f156c5f18ecaaf3f$var$k {
    constructor(){
        super(...arguments), this.type = 3;
    }
    j(t) {
        this.element[this.name] = t === $f156c5f18ecaaf3f$export$45b790e32b2810ee ? void 0 : t;
    }
}
const $f156c5f18ecaaf3f$var$I = $f156c5f18ecaaf3f$var$s ? $f156c5f18ecaaf3f$var$s.emptyScript : "";
class $f156c5f18ecaaf3f$var$L extends $f156c5f18ecaaf3f$var$k {
    constructor(){
        super(...arguments), this.type = 4;
    }
    j(t) {
        t && t !== $f156c5f18ecaaf3f$export$45b790e32b2810ee ? this.element.setAttribute(this.name, $f156c5f18ecaaf3f$var$I) : this.element.removeAttribute(this.name);
    }
}
class $f156c5f18ecaaf3f$var$z extends $f156c5f18ecaaf3f$var$k {
    constructor(t, i, s, e, o){
        super(t, i, s, e, o), this.type = 5;
    }
    _$AI(t, i = this) {
        var s;
        if ((t = null !== (s = $f156c5f18ecaaf3f$var$S(this, t, i, 0)) && void 0 !== s ? s : $f156c5f18ecaaf3f$export$45b790e32b2810ee) === $f156c5f18ecaaf3f$export$9c068ae9cc5db4e8) return;
        const e = this._$AH, o = t === $f156c5f18ecaaf3f$export$45b790e32b2810ee && e !== $f156c5f18ecaaf3f$export$45b790e32b2810ee || t.capture !== e.capture || t.once !== e.once || t.passive !== e.passive, n = t !== $f156c5f18ecaaf3f$export$45b790e32b2810ee && (e === $f156c5f18ecaaf3f$export$45b790e32b2810ee || o);
        o && this.element.removeEventListener(this.name, this, e), n && this.element.addEventListener(this.name, this, t), this._$AH = t;
    }
    handleEvent(t) {
        var i, s;
        "function" == typeof this._$AH ? this._$AH.call(null !== (s = null === (i = this.options) || void 0 === i ? void 0 : i.host) && void 0 !== s ? s : this.element, t) : this._$AH.handleEvent(t);
    }
}
class $f156c5f18ecaaf3f$var$Z {
    constructor(t, i, s){
        this.element = t, this.type = 6, this._$AN = void 0, this._$AM = i, this.options = s;
    }
    get _$AU() {
        return this._$AM._$AU;
    }
    _$AI(t) {
        $f156c5f18ecaaf3f$var$S(this, t);
    }
}
const $f156c5f18ecaaf3f$export$8613d1ca9052b22e = {
    O: $f156c5f18ecaaf3f$var$o,
    P: $f156c5f18ecaaf3f$var$n,
    A: $f156c5f18ecaaf3f$var$l,
    C: 1,
    M: $f156c5f18ecaaf3f$var$V,
    L: $f156c5f18ecaaf3f$var$M,
    R: $f156c5f18ecaaf3f$var$v,
    D: $f156c5f18ecaaf3f$var$S,
    I: $f156c5f18ecaaf3f$var$R,
    V: $f156c5f18ecaaf3f$var$k,
    H: $f156c5f18ecaaf3f$var$L,
    N: $f156c5f18ecaaf3f$var$z,
    U: $f156c5f18ecaaf3f$var$H,
    F: $f156c5f18ecaaf3f$var$Z
}, $f156c5f18ecaaf3f$var$B = $f156c5f18ecaaf3f$var$i.litHtmlPolyfillSupport;
null == $f156c5f18ecaaf3f$var$B || $f156c5f18ecaaf3f$var$B($f156c5f18ecaaf3f$var$N, $f156c5f18ecaaf3f$var$R), (null !== ($f156c5f18ecaaf3f$var$t = $f156c5f18ecaaf3f$var$i.litHtmlVersions) && void 0 !== $f156c5f18ecaaf3f$var$t ? $f156c5f18ecaaf3f$var$t : $f156c5f18ecaaf3f$var$i.litHtmlVersions = []).push("2.8.0");
const $f156c5f18ecaaf3f$export$b3890eb0ae9dca99 = (t, i, s)=>{
    var e, o;
    const n = null !== (e = null == s ? void 0 : s.renderBefore) && void 0 !== e ? e : i;
    let l = n._$litPart$;
    if (void 0 === l) {
        const t = null !== (o = null == s ? void 0 : s.renderBefore) && void 0 !== o ? o : null;
        n._$litPart$ = l = new $f156c5f18ecaaf3f$var$R(i.insertBefore($f156c5f18ecaaf3f$var$u(), t), t, void 0, null != s ? s : {});
    }
    return l._$AI(t), l;
};


/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */ var $ab210b2da7b39b9d$var$l, $ab210b2da7b39b9d$var$o;
const $ab210b2da7b39b9d$export$8bf27daf9e8907c9 = (0, $e620ef0d8bdd6ef5$export$c7c07a37856565d);
class $ab210b2da7b39b9d$export$3f2f9f5909897157 extends (0, $e620ef0d8bdd6ef5$export$c7c07a37856565d) {
    constructor(){
        super(...arguments), this.renderOptions = {
            host: this
        }, this._$Do = void 0;
    }
    createRenderRoot() {
        var t, e;
        const i = super.createRenderRoot();
        return null !== (t = (e = this.renderOptions).renderBefore) && void 0 !== t || (e.renderBefore = i.firstChild), i;
    }
    update(t) {
        const i = this.render();
        this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t), this._$Do = (0, $f156c5f18ecaaf3f$export$b3890eb0ae9dca99)(i, this.renderRoot, this.renderOptions);
    }
    connectedCallback() {
        var t;
        super.connectedCallback(), null === (t = this._$Do) || void 0 === t || t.setConnected(!0);
    }
    disconnectedCallback() {
        var t;
        super.disconnectedCallback(), null === (t = this._$Do) || void 0 === t || t.setConnected(!1);
    }
    render() {
        return 0, $f156c5f18ecaaf3f$export$9c068ae9cc5db4e8;
    }
}
$ab210b2da7b39b9d$export$3f2f9f5909897157.finalized = !0, $ab210b2da7b39b9d$export$3f2f9f5909897157._$litElement$ = !0, null === ($ab210b2da7b39b9d$var$l = globalThis.litElementHydrateSupport) || void 0 === $ab210b2da7b39b9d$var$l || $ab210b2da7b39b9d$var$l.call(globalThis, {
    LitElement: $ab210b2da7b39b9d$export$3f2f9f5909897157
});
const $ab210b2da7b39b9d$var$n = globalThis.litElementPolyfillSupport;
null == $ab210b2da7b39b9d$var$n || $ab210b2da7b39b9d$var$n({
    LitElement: $ab210b2da7b39b9d$export$3f2f9f5909897157
});
const $ab210b2da7b39b9d$export$f5c524615a7708d6 = {
    _$AK: (t, e, i)=>{
        t._$AK(e, i);
    },
    _$AL: (t)=>t._$AL
};
(null !== ($ab210b2da7b39b9d$var$o = globalThis.litElementVersions) && void 0 !== $ab210b2da7b39b9d$var$o ? $ab210b2da7b39b9d$var$o : globalThis.litElementVersions = []).push("3.3.3");


/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */ const $7d73aec7fd8dd996$export$6acf61af03e62db = !1;




/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */ const $8e719a98b1b15d5f$export$da64fc29f17f9d0e = (e)=>(n)=>"function" == typeof n ? ((e, n)=>(customElements.define(e, n), n))(e, n) : ((e, n)=>{
            const { kind: t, elements: s } = n;
            return {
                kind: t,
                elements: s,
                finisher (n) {
                    customElements.define(e, n);
                }
            };
        })(e, n);


/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */ const $8fbcd235ba38df66$var$i = (i, e)=>"method" === e.kind && e.descriptor && !("value" in e.descriptor) ? {
        ...e,
        finisher (n) {
            n.createProperty(e.key, i);
        }
    } : {
        kind: "field",
        key: Symbol(),
        placement: "own",
        descriptor: {},
        originalKey: e.key,
        initializer () {
            "function" == typeof e.initializer && (this[e.key] = e.initializer.call(this));
        },
        finisher (n) {
            n.createProperty(e.key, i);
        }
    }, $8fbcd235ba38df66$var$e = (i, e, n)=>{
    e.constructor.createProperty(n, i);
};
function $8fbcd235ba38df66$export$d541bacb2bda4494(n) {
    return (t, o)=>void 0 !== o ? $8fbcd235ba38df66$var$e(n, t, o) : $8fbcd235ba38df66$var$i(n, t);
}



/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */ function $d728c145a8b96d94$export$ca000e230c0caa3e(t) {
    return (0, $8fbcd235ba38df66$export$d541bacb2bda4494)({
        ...t,
        state: !0
    });
}


/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */ const $1b379d642bebdcd8$export$29fd0ed4087278b5 = (e, t, o)=>{
    Object.defineProperty(t, o, e);
}, $1b379d642bebdcd8$export$18eb0154d0069a01 = (e, t)=>({
        kind: "method",
        placement: "prototype",
        key: t.key,
        descriptor: e
    }), $1b379d642bebdcd8$export$757d561a932dc1cb = ({ finisher: e, descriptor: t })=>(o, n)=>{
        var r;
        if (void 0 === n) {
            const n = null !== (r = o.originalKey) && void 0 !== r ? r : o.key, i = null != t ? {
                kind: "method",
                placement: "prototype",
                key: n,
                descriptor: t(o.key)
            } : {
                ...o,
                key: n
            };
            return null != e && (i.finisher = function(t) {
                e(t, n);
            }), i;
        }
        {
            const r = o.constructor;
            void 0 !== t && Object.defineProperty(o, n, t(n)), null == e || e(r, n);
        }
    };


/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */ function $5e6239f42387ad50$export$b2b799818fbabcf3(e) {
    return (0, $1b379d642bebdcd8$export$757d561a932dc1cb)({
        finisher: (r, t)=>{
            Object.assign(r.prototype[t], e);
        }
    });
}



/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */ function $5b7c5dc48a1578e2$export$2fa187e846a241c4(i, n) {
    return (0, $1b379d642bebdcd8$export$757d561a932dc1cb)({
        descriptor: (o)=>{
            const t = {
                get () {
                    var o, n;
                    return null !== (n = null === (o = this.renderRoot) || void 0 === o ? void 0 : o.querySelector(i)) && void 0 !== n ? n : null;
                },
                enumerable: !0,
                configurable: !0
            };
            if (n) {
                const n = "symbol" == typeof o ? Symbol() : "__" + o;
                t.get = function() {
                    var o, t;
                    return void 0 === this[n] && (this[n] = null !== (t = null === (o = this.renderRoot) || void 0 === o ? void 0 : o.querySelector(i)) && void 0 !== t ? t : null), this[n];
                };
            }
            return t;
        }
    });
}



/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */ function $5e308599118f65a6$export$dcd0d083aa86c355(e) {
    return (0, $1b379d642bebdcd8$export$757d561a932dc1cb)({
        descriptor: (r)=>({
                get () {
                    var r, o;
                    return null !== (o = null === (r = this.renderRoot) || void 0 === r ? void 0 : r.querySelectorAll(e)) && void 0 !== o ? o : [];
                },
                enumerable: !0,
                configurable: !0
            })
    });
}



/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */ function $bbf857d70a3f8828$export$163dfc35cc43f240(e) {
    return (0, $1b379d642bebdcd8$export$757d561a932dc1cb)({
        descriptor: (r)=>({
                async get () {
                    var r;
                    return await this.updateComplete, null === (r = this.renderRoot) || void 0 === r ? void 0 : r.querySelector(e);
                },
                enumerable: !0,
                configurable: !0
            })
    });
}



/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */ var $dfdcaea63035e5b6$var$n;
const $dfdcaea63035e5b6$var$e = null != (null === ($dfdcaea63035e5b6$var$n = window.HTMLSlotElement) || void 0 === $dfdcaea63035e5b6$var$n ? void 0 : $dfdcaea63035e5b6$var$n.prototype.assignedElements) ? (o, n)=>o.assignedElements(n) : (o, n)=>o.assignedNodes(n).filter((o)=>o.nodeType === Node.ELEMENT_NODE);
function $dfdcaea63035e5b6$export$4682af2d9ee91415(n) {
    const { slot: l, selector: t } = null != n ? n : {};
    return (0, $1b379d642bebdcd8$export$757d561a932dc1cb)({
        descriptor: (o)=>({
                get () {
                    var o;
                    const r = "slot" + (l ? `[name=${l}]` : ":not([name])"), i = null === (o = this.renderRoot) || void 0 === o ? void 0 : o.querySelector(r), s = null != i ? $dfdcaea63035e5b6$var$e(i, n) : [];
                    return t ? s.filter((o)=>o.matches(t)) : s;
                },
                enumerable: !0,
                configurable: !0
            })
    });
}




/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */ function $0dbad5fc6fe57972$export$1bdbe53f9df1b8(o, n, r) {
    let l, s = o;
    return "object" == typeof o ? (s = o.slot, l = o) : l = {
        flatten: n
    }, r ? (0, $dfdcaea63035e5b6$export$4682af2d9ee91415)({
        slot: s,
        flatten: n,
        selector: r
    }) : (0, $1b379d642bebdcd8$export$757d561a932dc1cb)({
        descriptor: (e)=>({
                get () {
                    var e, t;
                    const o = "slot" + (s ? `[name=${s}]` : ":not([name])"), n = null === (e = this.renderRoot) || void 0 === e ? void 0 : e.querySelector(o);
                    return null !== (t = null == n ? void 0 : n.assignedNodes(l)) && void 0 !== t ? t : [];
                },
                enumerable: !0,
                configurable: !0
            })
    });
}




function $ca07559e1b107080$export$2e2bcd8739ae039(dirtyNumber) {
    if (dirtyNumber === null || dirtyNumber === true || dirtyNumber === false) return NaN;
    var number = Number(dirtyNumber);
    if (isNaN(number)) return number;
    return number < 0 ? Math.ceil(number) : Math.floor(number);
}


function $86c3f3a2c58deee1$export$2e2bcd8739ae039(o) {
    "@babel/helpers - typeof";
    return $86c3f3a2c58deee1$export$2e2bcd8739ae039 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o) {
        return typeof o;
    } : function(o) {
        return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
    }, $86c3f3a2c58deee1$export$2e2bcd8739ae039(o);
}


function $81f0280ac5d02139$export$2e2bcd8739ae039(required, args) {
    if (args.length < required) throw new TypeError(required + ' argument' + (required > 1 ? 's' : '') + ' required, but only ' + args.length + ' present');
}


function $e69637aea3e4b43a$export$2e2bcd8739ae039(argument) {
    (0, $81f0280ac5d02139$export$2e2bcd8739ae039)(1, arguments);
    var argStr = Object.prototype.toString.call(argument);
    // Clone the date
    if (argument instanceof Date || (0, $86c3f3a2c58deee1$export$2e2bcd8739ae039)(argument) === 'object' && argStr === '[object Date]') // Prevent the date to lose the milliseconds when passed to new Date() in IE10
    return new Date(argument.getTime());
    else if (typeof argument === 'number' || argStr === '[object Number]') return new Date(argument);
    else {
        if ((typeof argument === 'string' || argStr === '[object String]') && typeof console !== 'undefined') {
            // eslint-disable-next-line no-console
            console.warn("Starting with v2.0.0-beta.1 date-fns doesn't accept strings as date arguments. Please use `parseISO` to parse strings. See: https://github.com/date-fns/date-fns/blob/master/docs/upgradeGuide.md#string-arguments");
            // eslint-disable-next-line no-console
            console.warn(new Error().stack);
        }
        return new Date(NaN);
    }
}



function $2a35cc8bb86b193e$export$2e2bcd8739ae039(dirtyDate, dirtyAmount) {
    (0, $81f0280ac5d02139$export$2e2bcd8739ae039)(2, arguments);
    var date = (0, $e69637aea3e4b43a$export$2e2bcd8739ae039)(dirtyDate);
    var amount = (0, $ca07559e1b107080$export$2e2bcd8739ae039)(dirtyAmount);
    if (isNaN(amount)) return new Date(NaN);
    if (!amount) // If 0 days, no-op to avoid changing times in the hour before end of DST
    return date;
    date.setDate(date.getDate() + amount);
    return date;
}




function $8b79622fa73e11c7$export$2e2bcd8739ae039(dirtyDate, dirtyAmount) {
    (0, $81f0280ac5d02139$export$2e2bcd8739ae039)(2, arguments);
    var date = (0, $e69637aea3e4b43a$export$2e2bcd8739ae039)(dirtyDate);
    var amount = (0, $ca07559e1b107080$export$2e2bcd8739ae039)(dirtyAmount);
    if (isNaN(amount)) return new Date(NaN);
    if (!amount) // If 0 months, no-op to avoid changing times in the hour before end of DST
    return date;
    var dayOfMonth = date.getDate();
    // The JS Date object supports date math by accepting out-of-bounds values for
    // month, day, etc. For example, new Date(2020, 0, 0) returns 31 Dec 2019 and
    // new Date(2020, 13, 1) returns 1 Feb 2021.  This is *almost* the behavior we
    // want except that dates will wrap around the end of a month, meaning that
    // new Date(2020, 13, 31) will return 3 Mar 2021 not 28 Feb 2021 as desired. So
    // we'll default to the end of the desired month by adding 1 to the desired
    // month and using a date of 0 to back up one day to the end of the desired
    // month.
    var endOfDesiredMonth = new Date(date.getTime());
    endOfDesiredMonth.setMonth(date.getMonth() + amount + 1, 0);
    var daysInMonth = endOfDesiredMonth.getDate();
    if (dayOfMonth >= daysInMonth) // If we're already at the end of the month, then this is the correct date
    // and we're done.
    return endOfDesiredMonth;
    else {
        // Otherwise, we now know that setting the original day-of-month value won't
        // cause an overflow, so set the desired day-of-month. Note that we can't
        // just set the date of `endOfDesiredMonth` because that object may have had
        // its time changed in the unusual case where where a DST transition was on
        // the last day of the month and its local time was in the hour skipped or
        // repeated next to a DST transition.  So we use `date` instead which is
        // guaranteed to still have the original time.
        date.setFullYear(endOfDesiredMonth.getFullYear(), endOfDesiredMonth.getMonth(), dayOfMonth);
        return date;
    }
}




function $f7dedc38119eb89c$export$2e2bcd8739ae039(dirtyDate, dirtyAmount) {
    (0, $81f0280ac5d02139$export$2e2bcd8739ae039)(2, arguments);
    var amount = (0, $ca07559e1b107080$export$2e2bcd8739ae039)(dirtyAmount);
    var days = amount * 7;
    return (0, $2a35cc8bb86b193e$export$2e2bcd8739ae039)(dirtyDate, days);
}




function $1862e23bf1238497$export$2e2bcd8739ae039(dirtyDate, dirtyAmount) {
    (0, $81f0280ac5d02139$export$2e2bcd8739ae039)(2, arguments);
    var amount = (0, $ca07559e1b107080$export$2e2bcd8739ae039)(dirtyAmount);
    return (0, $8b79622fa73e11c7$export$2e2bcd8739ae039)(dirtyDate, amount * 12);
}


/**
 * Google Chrome as of 67.0.3396.87 introduced timezones with offset that includes seconds.
 * They usually appear for dates that denote time before the timezones were introduced
 * (e.g. for 'Europe/Prague' timezone the offset is GMT+00:57:44 before 1 October 1891
 * and GMT+01:00:00 after that date)
 *
 * Date#getTimezoneOffset returns the offset in minutes and would return 57 for the example above,
 * which would lead to incorrect calculations.
 *
 * This function returns the timezone offset in milliseconds that takes seconds in account.
 */ function $cf6b630c87cae149$export$2e2bcd8739ae039(date) {
    var utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds()));
    utcDate.setUTCFullYear(date.getFullYear());
    return date.getTime() - utcDate.getTime();
}




function $ccd099b41a2e6377$export$2e2bcd8739ae039(dirtyDate) {
    (0, $81f0280ac5d02139$export$2e2bcd8739ae039)(1, arguments);
    var date = (0, $e69637aea3e4b43a$export$2e2bcd8739ae039)(dirtyDate);
    date.setHours(0, 0, 0, 0);
    return date;
}



var $effd7d694e5fbc18$var$MILLISECONDS_IN_DAY = 86400000;
function $effd7d694e5fbc18$export$2e2bcd8739ae039(dirtyDateLeft, dirtyDateRight) {
    (0, $81f0280ac5d02139$export$2e2bcd8739ae039)(2, arguments);
    var startOfDayLeft = (0, $ccd099b41a2e6377$export$2e2bcd8739ae039)(dirtyDateLeft);
    var startOfDayRight = (0, $ccd099b41a2e6377$export$2e2bcd8739ae039)(dirtyDateRight);
    var timestampLeft = startOfDayLeft.getTime() - (0, $cf6b630c87cae149$export$2e2bcd8739ae039)(startOfDayLeft);
    var timestampRight = startOfDayRight.getTime() - (0, $cf6b630c87cae149$export$2e2bcd8739ae039)(startOfDayRight);
    // Round the number of days to the nearest integer
    // because the number of milliseconds in a day is not constant
    // (e.g. it's different in the day of the daylight saving time clock shift)
    return Math.round((timestampLeft - timestampRight) / $effd7d694e5fbc18$var$MILLISECONDS_IN_DAY);
}



// for accurate equality comparisons of UTC timestamps that end up
// having the same representation in local time, e.g. one hour before
// DST ends vs. the instant that DST ends.
function $37435ba8bd527020$var$compareLocalAsc(dateLeft, dateRight) {
    var diff = dateLeft.getFullYear() - dateRight.getFullYear() || dateLeft.getMonth() - dateRight.getMonth() || dateLeft.getDate() - dateRight.getDate() || dateLeft.getHours() - dateRight.getHours() || dateLeft.getMinutes() - dateRight.getMinutes() || dateLeft.getSeconds() - dateRight.getSeconds() || dateLeft.getMilliseconds() - dateRight.getMilliseconds();
    if (diff < 0) return -1;
    else if (diff > 0) return 1;
    else return diff;
}
function $37435ba8bd527020$export$2e2bcd8739ae039(dirtyDateLeft, dirtyDateRight) {
    (0, $81f0280ac5d02139$export$2e2bcd8739ae039)(2, arguments);
    var dateLeft = (0, $e69637aea3e4b43a$export$2e2bcd8739ae039)(dirtyDateLeft);
    var dateRight = (0, $e69637aea3e4b43a$export$2e2bcd8739ae039)(dirtyDateRight);
    var sign = $37435ba8bd527020$var$compareLocalAsc(dateLeft, dateRight);
    var difference = Math.abs((0, $effd7d694e5fbc18$export$2e2bcd8739ae039)(dateLeft, dateRight));
    dateLeft.setDate(dateLeft.getDate() - sign * difference);
    // Math.abs(diff in full days - diff in calendar days) === 1 if last calendar day is not full
    // If so, result must be decreased by 1 in absolute value
    var isLastDayNotFull = Number($37435ba8bd527020$var$compareLocalAsc(dateLeft, dateRight) === -sign);
    var result = sign * (difference - isLastDayNotFull);
    // Prevent negative zero
    return result === 0 ? 0 : result;
}



function $8d584c18ae78ebfa$export$2e2bcd8739ae039(dirtyDate) {
    (0, $81f0280ac5d02139$export$2e2bcd8739ae039)(1, arguments);
    var date = (0, $e69637aea3e4b43a$export$2e2bcd8739ae039)(dirtyDate);
    date.setHours(23, 59, 59, 999);
    return date;
}



function $6c208c437c2d1687$export$2e2bcd8739ae039(dirtyDate) {
    (0, $81f0280ac5d02139$export$2e2bcd8739ae039)(1, arguments);
    var date = (0, $e69637aea3e4b43a$export$2e2bcd8739ae039)(dirtyDate);
    var month = date.getMonth();
    date.setFullYear(date.getFullYear(), month + 1, 0);
    date.setHours(23, 59, 59, 999);
    return date;
}

var $3d25ff6a650f17a1$var$defaultOptions = {};
function $3d25ff6a650f17a1$export$430a3269e24b912e() {
    return $3d25ff6a650f17a1$var$defaultOptions;
}
function $3d25ff6a650f17a1$export$95365be1b0704abc(newOptions) {
    $3d25ff6a650f17a1$var$defaultOptions = newOptions;
}





function $30b05a86bf64c12d$export$2e2bcd8739ae039(dirtyDate, options) {
    var _ref, _ref2, _ref3, _options$weekStartsOn, _options$locale, _options$locale$optio, _defaultOptions$local, _defaultOptions$local2;
    (0, $81f0280ac5d02139$export$2e2bcd8739ae039)(1, arguments);
    var defaultOptions = (0, $3d25ff6a650f17a1$export$430a3269e24b912e)();
    var weekStartsOn = (0, $ca07559e1b107080$export$2e2bcd8739ae039)((_ref = (_ref2 = (_ref3 = (_options$weekStartsOn = options === null || options === void 0 ? void 0 : options.weekStartsOn) !== null && _options$weekStartsOn !== void 0 ? _options$weekStartsOn : options === null || options === void 0 ? void 0 : (_options$locale = options.locale) === null || _options$locale === void 0 ? void 0 : (_options$locale$optio = _options$locale.options) === null || _options$locale$optio === void 0 ? void 0 : _options$locale$optio.weekStartsOn) !== null && _ref3 !== void 0 ? _ref3 : defaultOptions.weekStartsOn) !== null && _ref2 !== void 0 ? _ref2 : (_defaultOptions$local = defaultOptions.locale) === null || _defaultOptions$local === void 0 ? void 0 : (_defaultOptions$local2 = _defaultOptions$local.options) === null || _defaultOptions$local2 === void 0 ? void 0 : _defaultOptions$local2.weekStartsOn) !== null && _ref !== void 0 ? _ref : 0);
    // Test if weekStartsOn is between 0 and 6 _and_ is not NaN
    if (!(weekStartsOn >= 0 && weekStartsOn <= 6)) throw new RangeError('weekStartsOn must be between 0 and 6 inclusively');
    var date = (0, $e69637aea3e4b43a$export$2e2bcd8739ae039)(dirtyDate);
    var day = date.getDay();
    var diff = (day < weekStartsOn ? -7 : 0) + 6 - (day - weekStartsOn);
    date.setDate(date.getDate() + diff);
    date.setHours(23, 59, 59, 999);
    return date;
}



function $375d2cf836463612$export$2e2bcd8739ae039(dirtyDate) {
    (0, $81f0280ac5d02139$export$2e2bcd8739ae039)(1, arguments);
    var date = (0, $e69637aea3e4b43a$export$2e2bcd8739ae039)(dirtyDate);
    var year = date.getFullYear();
    date.setFullYear(year + 1, 0, 0);
    date.setHours(23, 59, 59, 999);
    return date;
}



function $30fabb821783a09e$export$2e2bcd8739ae039(dirtyDate) {
    (0, $81f0280ac5d02139$export$2e2bcd8739ae039)(1, arguments);
    var date = (0, $e69637aea3e4b43a$export$2e2bcd8739ae039)(dirtyDate);
    date.setDate(1);
    date.setHours(0, 0, 0, 0);
    return date;
}





function $60f16a60e924b0a4$export$2e2bcd8739ae039(dirtyDate, options) {
    var _ref, _ref2, _ref3, _options$weekStartsOn, _options$locale, _options$locale$optio, _defaultOptions$local, _defaultOptions$local2;
    (0, $81f0280ac5d02139$export$2e2bcd8739ae039)(1, arguments);
    var defaultOptions = (0, $3d25ff6a650f17a1$export$430a3269e24b912e)();
    var weekStartsOn = (0, $ca07559e1b107080$export$2e2bcd8739ae039)((_ref = (_ref2 = (_ref3 = (_options$weekStartsOn = options === null || options === void 0 ? void 0 : options.weekStartsOn) !== null && _options$weekStartsOn !== void 0 ? _options$weekStartsOn : options === null || options === void 0 ? void 0 : (_options$locale = options.locale) === null || _options$locale === void 0 ? void 0 : (_options$locale$optio = _options$locale.options) === null || _options$locale$optio === void 0 ? void 0 : _options$locale$optio.weekStartsOn) !== null && _ref3 !== void 0 ? _ref3 : defaultOptions.weekStartsOn) !== null && _ref2 !== void 0 ? _ref2 : (_defaultOptions$local = defaultOptions.locale) === null || _defaultOptions$local === void 0 ? void 0 : (_defaultOptions$local2 = _defaultOptions$local.options) === null || _defaultOptions$local2 === void 0 ? void 0 : _defaultOptions$local2.weekStartsOn) !== null && _ref !== void 0 ? _ref : 0);
    // Test if weekStartsOn is between 0 and 6 _and_ is not NaN
    if (!(weekStartsOn >= 0 && weekStartsOn <= 6)) throw new RangeError('weekStartsOn must be between 0 and 6 inclusively');
    var date = (0, $e69637aea3e4b43a$export$2e2bcd8739ae039)(dirtyDate);
    var day = date.getDay();
    var diff = (day < weekStartsOn ? 7 : 0) + day - weekStartsOn;
    date.setDate(date.getDate() - diff);
    date.setHours(0, 0, 0, 0);
    return date;
}



function $bec52459850b0ded$export$2e2bcd8739ae039(dirtyDate) {
    (0, $81f0280ac5d02139$export$2e2bcd8739ae039)(1, arguments);
    var cleanDate = (0, $e69637aea3e4b43a$export$2e2bcd8739ae039)(dirtyDate);
    var date = new Date(0);
    date.setFullYear(cleanDate.getFullYear(), 0, 1);
    date.setHours(0, 0, 0, 0);
    return date;
}





function $583dd9ca478a0113$export$2e2bcd8739ae039(dirtyDate, dirtyAmount) {
    (0, $81f0280ac5d02139$export$2e2bcd8739ae039)(2, arguments);
    var timestamp = (0, $e69637aea3e4b43a$export$2e2bcd8739ae039)(dirtyDate).getTime();
    var amount = (0, $ca07559e1b107080$export$2e2bcd8739ae039)(dirtyAmount);
    return new Date(timestamp + amount);
}



var $5afc45fc66efe949$var$MILLISECONDS_IN_HOUR = 3600000;
function $5afc45fc66efe949$export$2e2bcd8739ae039(dirtyDate, dirtyAmount) {
    (0, $81f0280ac5d02139$export$2e2bcd8739ae039)(2, arguments);
    var amount = (0, $ca07559e1b107080$export$2e2bcd8739ae039)(dirtyAmount);
    return (0, $583dd9ca478a0113$export$2e2bcd8739ae039)(dirtyDate, amount * $5afc45fc66efe949$var$MILLISECONDS_IN_HOUR);
}




function $94dea91cc169b2bc$export$2e2bcd8739ae039(dirtyDate, dirtyAmount) {
    (0, $81f0280ac5d02139$export$2e2bcd8739ae039)(2, arguments);
    var amount = (0, $ca07559e1b107080$export$2e2bcd8739ae039)(dirtyAmount);
    return (0, $5afc45fc66efe949$export$2e2bcd8739ae039)(dirtyDate, -amount);
}


const $e33bd269540e00fa$export$ccb82aff39074fc0 = (hass, statisticIds)=>hass.callWS({
        type: "recorder/get_statistics_metadata",
        statistic_ids: statisticIds
    });
const $e33bd269540e00fa$export$23931e6715d4c9e2 = (hass, startTime, endTime, statisticIds, period = "hour", units, types)=>hass.callWS({
        type: "recorder/statistics_during_period",
        start_time: startTime.toISOString(),
        end_time: endTime?.toISOString(),
        statistic_ids: statisticIds,
        period: period,
        units: units,
        types: types
    });
const $e33bd269540e00fa$export$d88a31099da646ad = (hass, statisticsId, statisticsMetaData)=>{
    let unit;
    if (statisticsId) unit = hass.states[statisticsId]?.attributes.unit_of_measurement;
    return unit === undefined ? statisticsMetaData?.statistics_unit_of_measurement : unit;
};
const $e33bd269540e00fa$export$8ca559c1f65bb9d = (hass, statisticsId, statisticsMetaData)=>{
    const entity = hass.states?.[statisticsId];
    const friendlyName = entity?.attributes?.friendly_name ?? statisticsMetaData?.name;
    return friendlyName || statisticsId;
};


const $834b6972c14ca89a$export$e60cfe038231c681 = [
    "--energy-grid-consumption-color",
    "--energy-grid-return-color",
    "--energy-solar-color",
    "--energy-battery-in-color",
    "--energy-battery-out-color"
];
const $834b6972c14ca89a$export$73697d51fea399c1 = 1.5;
const $834b6972c14ca89a$export$7372184653ac2416 = 50;
const $834b6972c14ca89a$var$BAR_FILL_ALPHA = 0.6;
const $834b6972c14ca89a$var$LINE_AREA_ALPHA = 0.2;
const $834b6972c14ca89a$var$clampAlpha = (value)=>Math.max(0, Math.min(1, Number.isFinite(value) ? value : 1));
const $834b6972c14ca89a$var$hexToRgb = (value)=>{
    const hex = value.replace("#", "").trim();
    if (hex.length === 3) {
        const r = parseInt(hex[0] + hex[0], 16);
        const g = parseInt(hex[1] + hex[1], 16);
        const b = parseInt(hex[2] + hex[2], 16);
        return {
            r: r,
            g: g,
            b: b
        };
    }
    if (hex.length === 6) {
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        return {
            r: r,
            g: g,
            b: b
        };
    }
    return null;
};
const $834b6972c14ca89a$var$rgbStringToRgb = (value)=>{
    const match = value.trim().match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*[\d.]+\s*)?\)/i);
    if (!match) return null;
    return {
        r: Number(match[1]),
        g: Number(match[2]),
        b: Number(match[3])
    };
};
const $834b6972c14ca89a$var$applyAlpha = (color, alpha)=>{
    const trimmed = color.trim();
    const normalizedAlpha = $834b6972c14ca89a$var$clampAlpha(alpha);
    if (trimmed.startsWith("#")) {
        const rgb = $834b6972c14ca89a$var$hexToRgb(trimmed);
        if (rgb) return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${normalizedAlpha})`;
    } else if (trimmed.startsWith("rgb")) {
        const rgb = $834b6972c14ca89a$var$rgbStringToRgb(trimmed);
        if (rgb) return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${normalizedAlpha})`;
    }
    return trimmed;
};
const $834b6972c14ca89a$export$ac226b8a7831eaf7 = ({ hass: hass, statistics: statistics, metadata: metadata, configSeries: configSeries, colorPalette: colorPalette, computedStyle: computedStyle })=>{
    const palette = colorPalette.length ? colorPalette : $834b6972c14ca89a$export$e60cfe038231c681;
    const legend = [];
    const unitBySeries = new Map();
    const seriesById = new Map();
    const output = [];
    configSeries.forEach((seriesConfig, index)=>{
        const raw = statistics?.[seriesConfig.statistic_id];
        if (!raw?.length) return;
        const meta = metadata?.[seriesConfig.statistic_id];
        const statType = seriesConfig.stat_type ?? "change";
        const chartType = seriesConfig.chart_type ?? "bar";
        const multiplier = seriesConfig.multiply ?? 1;
        const offset = seriesConfig.add ?? 0;
        const smoothValue = typeof seriesConfig.smooth === "number" ? Math.max(0, Math.min(1, seriesConfig.smooth)) : seriesConfig.smooth;
        const name = seriesConfig.name ?? meta?.name ?? hass.states[seriesConfig.statistic_id]?.attributes.friendly_name ?? seriesConfig.statistic_id;
        const colorToken = seriesConfig.color ?? palette[index % palette.length] ?? $834b6972c14ca89a$export$e60cfe038231c681[index % $834b6972c14ca89a$export$e60cfe038231c681.length];
        let colorValue = colorToken;
        if (colorToken.startsWith("#") || colorToken.startsWith("rgb")) colorValue = colorToken;
        else if (colorToken.startsWith("var(")) {
            const extracted = colorToken.slice(4, -1).trim();
            const resolved = computedStyle.getPropertyValue(extracted)?.trim();
            if (resolved) colorValue = resolved;
        } else {
            const resolved = computedStyle.getPropertyValue(colorToken)?.trim();
            if (resolved) colorValue = resolved;
        }
        colorValue = colorValue.trim();
        const fillColor = $834b6972c14ca89a$var$applyAlpha(colorValue, $834b6972c14ca89a$var$BAR_FILL_ALPHA);
        const hoverColor = $834b6972c14ca89a$var$applyAlpha(colorValue, Math.min(1, $834b6972c14ca89a$var$BAR_FILL_ALPHA + 0.2));
        const id = `${seriesConfig.statistic_id}:${statType}:${chartType}:${index}`;
        unitBySeries.set(id, meta?.statistics_unit_of_measurement);
        seriesById.set(id, seriesConfig);
        const dataPoints = raw.map((entry)=>{
            const statKey = statType;
            const value = entry[statKey];
            const date = entry.start ?? entry.end;
            if (typeof value !== "number" || Number.isNaN(value)) return [
                date,
                null
            ];
            const transformed = value * multiplier + offset;
            return [
                date,
                transformed
            ];
        });
        if (chartType === "line") {
            const lineItemStyle = {
                color: colorValue,
                borderColor: colorValue
            };
            const lineSeries = {
                id: id,
                name: name,
                type: "line",
                smooth: smoothValue ?? true,
                areaStyle: seriesConfig.area ? {} : undefined,
                data: dataPoints,
                stack: seriesConfig.stack,
                stackStrategy: seriesConfig.stack_strategy,
                yAxisIndex: seriesConfig.y_axis === "right" ? 1 : 0,
                emphasis: {
                    focus: "series",
                    itemStyle: {
                        color: hoverColor
                    }
                },
                lineStyle: {
                    width: 2,
                    color: colorValue
                },
                itemStyle: {
                    ...lineItemStyle
                },
                color: colorValue
            };
            if (seriesConfig.area) lineSeries.areaStyle = {
                ...lineSeries.areaStyle ?? {},
                color: $834b6972c14ca89a$var$applyAlpha(colorValue, $834b6972c14ca89a$var$LINE_AREA_ALPHA)
            };
            output.push(lineSeries);
        } else {
            const barSeries = {
                id: id,
                name: name,
                type: "bar",
                stack: seriesConfig.stack,
                stackStrategy: seriesConfig.stack_strategy,
                data: dataPoints,
                yAxisIndex: seriesConfig.y_axis === "right" ? 1 : 0,
                emphasis: {
                    focus: "series",
                    itemStyle: {
                        color: hoverColor,
                        borderColor: colorValue
                    }
                },
                itemStyle: {
                    color: fillColor,
                    borderColor: colorValue,
                    borderWidth: $834b6972c14ca89a$export$73697d51fea399c1
                },
                color: fillColor,
                barMaxWidth: $834b6972c14ca89a$export$7372184653ac2416
            };
            output.push(barSeries);
        }
        legend.push({
            id: id,
            name: name,
            color: colorValue,
            hidden: seriesConfig.show_legend === false
        });
    });
    return {
        series: output,
        legend: legend,
        unitBySeries: unitBySeries,
        seriesById: seriesById
    };
};


const $c4fa7deb39259653$var$DEFAULT_PERIOD = {
    mode: "energy"
};
class $c4fa7deb39259653$export$535692f6ec92be60 extends (0, $ab210b2da7b39b9d$export$3f2f9f5909897157) {
    static{
        this.FALLBACK_WARNING = "[energy-custom-graph-card] Falling back to default period because energy date selection is unavailable.";
    }
    static{
        this.DEFAULT_STAT_TYPE = "change";
    }
    connectedCallback() {
        super.connectedCallback();
        if (this.hass && this._config) this._syncWithConfig();
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        this._teardownEnergyCollection();
    }
    willUpdate(changedProps) {
        if (changedProps.has("hass") && this.hass && this._config) this._syncWithConfig();
        if (changedProps.has("_config")) {
            const oldConfig = changedProps.get("_config");
            if (this.hass && this._config) this._syncWithConfig(oldConfig);
        }
    }
    _syncWithConfig(oldConfig) {
        if (!this._config || !this.hass) return;
        const needsEnergyCollection = this._needsEnergyCollection(this._config);
        const neededBefore = this._needsEnergyCollection(oldConfig);
        if (needsEnergyCollection) {
            const collectionKeyChanged = oldConfig?.collection_key !== this._config.collection_key;
            const selectionFlagChanged = oldConfig?.energy_date_selection !== this._config.energy_date_selection;
            if (collectionKeyChanged || selectionFlagChanged || !this._energyCollection && !this._collectionPollHandle) this._setupEnergyCollection();
        } else if (neededBefore) this._teardownEnergyCollection();
        const periodChanged = this._recalculatePeriod();
        const seriesChanged = !!oldConfig && JSON.stringify(oldConfig.series) !== JSON.stringify(this._config.series);
        if (periodChanged || seriesChanged || !this._statistics) this._loadStatistics();
    }
    _needsEnergyCollection(config) {
        return Boolean(config?.energy_date_selection);
    }
    _setupEnergyCollection(attempt = 0) {
        if (!this._config?.energy_date_selection || !this.hass) return;
        if (attempt === 0) this._teardownEnergyCollection();
        else if (this._collectionPollHandle) {
            window.clearTimeout(this._collectionPollHandle);
            this._collectionPollHandle = undefined;
        }
        const key = this._config.collection_key ? `_${this._config.collection_key}` : "_energy";
        const connection = this.hass.connection;
        const candidate = connection?.[key];
        if (candidate && typeof candidate.subscribe === "function") {
            if (this._collectionUnsub) {
                this._collectionUnsub();
                this._collectionUnsub = undefined;
            }
            this._energyCollection = candidate;
            this._loggedEnergyFallback = false;
            this._collectionUnsub = candidate.subscribe((data)=>{
                this._energyStart = data.start;
                this._energyEnd = data.end ?? undefined;
                const periodChanged = this._recalculatePeriod();
                if (periodChanged || !this._statistics) this._loadStatistics();
            });
            return;
        }
        const MAX_ATTEMPTS = 50;
        if (attempt >= MAX_ATTEMPTS) {
            if (!this._loggedEnergyFallback) {
                console.warn($c4fa7deb39259653$export$535692f6ec92be60.FALLBACK_WARNING);
                this._loggedEnergyFallback = true;
            }
            this._energyCollection = undefined;
            this._collectionUnsub = undefined;
            const periodChanged = this._recalculatePeriod();
            if (periodChanged || !this._statistics) this._loadStatistics();
            this._collectionPollHandle = window.setTimeout(()=>this._setupEnergyCollection(MAX_ATTEMPTS), 1000);
            return;
        }
        this._collectionPollHandle = window.setTimeout(()=>this._setupEnergyCollection(attempt + 1), 200);
    }
    _teardownEnergyCollection() {
        if (this._collectionPollHandle) {
            window.clearTimeout(this._collectionPollHandle);
            this._collectionPollHandle = undefined;
        }
        if (this._collectionUnsub) {
            this._collectionUnsub();
            this._collectionUnsub = undefined;
        }
        this._energyCollection = undefined;
        this._energyStart = undefined;
        this._energyEnd = undefined;
    }
    _recalculatePeriod() {
        const resolved = this._resolvePeriod();
        if (!resolved) return false;
        const { start: start, end: end } = resolved;
        const prevStart = this._periodStart?.getTime();
        const prevEnd = this._periodEnd?.getTime();
        const nextStart = start.getTime();
        const nextEnd = end?.getTime();
        const changed = prevStart !== nextStart || prevEnd !== nextEnd;
        if (changed) {
            this._periodStart = start;
            this._periodEnd = end;
        }
        return changed;
    }
    _resolvePeriod() {
        if (!this._config) return undefined;
        const periodConfig = this._config.period ?? $c4fa7deb39259653$var$DEFAULT_PERIOD;
        switch(periodConfig.mode){
            case "energy":
                if (this._config.energy_date_selection) {
                    const energyRange = this._getEnergyRange();
                    if (!energyRange) {
                        if (this._loggedEnergyFallback) return this._defaultEnergyRange();
                        return undefined;
                    }
                    return energyRange;
                }
                return this._defaultEnergyRange();
            case "relative":
                {
                    const base = this._config.energy_date_selection ? this._getEnergyRange() : this._defaultRelativeBase(periodConfig.unit);
                    if (!base) return undefined;
                    const offset = periodConfig.offset ?? 0;
                    switch(periodConfig.unit){
                        case "day":
                            {
                                const start = (0, $2a35cc8bb86b193e$export$2e2bcd8739ae039)(base.start, offset);
                                const end = base.end ? (0, $2a35cc8bb86b193e$export$2e2bcd8739ae039)(base.end, offset) : (0, $8d584c18ae78ebfa$export$2e2bcd8739ae039)((0, $2a35cc8bb86b193e$export$2e2bcd8739ae039)(base.start, offset));
                                return {
                                    start: start,
                                    end: end
                                };
                            }
                        case "week":
                            {
                                const start = (0, $f7dedc38119eb89c$export$2e2bcd8739ae039)(base.start, offset);
                                const end = base.end ? (0, $f7dedc38119eb89c$export$2e2bcd8739ae039)(base.end, offset) : (0, $30b05a86bf64c12d$export$2e2bcd8739ae039)((0, $f7dedc38119eb89c$export$2e2bcd8739ae039)(base.start, offset));
                                return {
                                    start: start,
                                    end: end
                                };
                            }
                        case "month":
                            {
                                const start = (0, $8b79622fa73e11c7$export$2e2bcd8739ae039)(base.start, offset);
                                const end = base.end ? (0, $8b79622fa73e11c7$export$2e2bcd8739ae039)(base.end, offset) : (0, $6c208c437c2d1687$export$2e2bcd8739ae039)((0, $8b79622fa73e11c7$export$2e2bcd8739ae039)(base.start, offset));
                                return {
                                    start: start,
                                    end: end
                                };
                            }
                        case "year":
                        default:
                            {
                                const start = (0, $1862e23bf1238497$export$2e2bcd8739ae039)(base.start, offset);
                                const end = base.end ? (0, $1862e23bf1238497$export$2e2bcd8739ae039)(base.end, offset) : (0, $375d2cf836463612$export$2e2bcd8739ae039)((0, $1862e23bf1238497$export$2e2bcd8739ae039)(base.start, offset));
                                return {
                                    start: start,
                                    end: end
                                };
                            }
                    }
                }
            case "fixed":
                {
                    const start = new Date(periodConfig.start);
                    if (Number.isNaN(start.getTime())) throw new Error("Invalid start date in fixed period configuration");
                    const end = periodConfig.end ? new Date(periodConfig.end) : undefined;
                    if (end && Number.isNaN(end.getTime())) throw new Error("Invalid end date in fixed period configuration");
                    return {
                        start: start,
                        end: end
                    };
                }
            default:
                return undefined;
        }
    }
    _getEnergyRange() {
        if (!this._energyStart) return undefined;
        return {
            start: this._energyStart,
            end: this._energyEnd
        };
    }
    _defaultEnergyRange() {
        return {
            start: (0, $ccd099b41a2e6377$export$2e2bcd8739ae039)(new Date()),
            end: (0, $8d584c18ae78ebfa$export$2e2bcd8739ae039)(new Date())
        };
    }
    _defaultRelativeBase(unit) {
        const now = new Date();
        switch(unit){
            case "day":
                return this._defaultEnergyRange();
            case "week":
                return {
                    start: (0, $60f16a60e924b0a4$export$2e2bcd8739ae039)(now),
                    end: (0, $30b05a86bf64c12d$export$2e2bcd8739ae039)(now)
                };
            case "month":
                return {
                    start: (0, $30fabb821783a09e$export$2e2bcd8739ae039)(now),
                    end: (0, $6c208c437c2d1687$export$2e2bcd8739ae039)(now)
                };
            case "year":
            default:
                return {
                    start: (0, $bec52459850b0ded$export$2e2bcd8739ae039)(now),
                    end: (0, $375d2cf836463612$export$2e2bcd8739ae039)(now)
                };
        }
    }
    async _loadStatistics() {
        if (!this._config || !this.hass || !this._periodStart) return;
        const statisticIds = Array.from(new Set(this._config.series.map((item)=>item.statistic_id)));
        if (!statisticIds.length) {
            this._statistics = undefined;
            this._metadata = undefined;
            return;
        }
        const statTypes = Array.from(new Set(this._config.series.map((series)=>series.stat_type ?? $c4fa7deb39259653$export$535692f6ec92be60.DEFAULT_STAT_TYPE)));
        const statsPeriod = this._determineStatisticsPeriod(this._periodStart, this._periodEnd);
        const fetchId = ++this._activeFetch;
        const loadingAtStart = !this._statistics;
        if (loadingAtStart) this._isLoading = true;
        try {
            const [metadataArray, statistics] = await Promise.all([
                (0, $e33bd269540e00fa$export$ccb82aff39074fc0)(this.hass, statisticIds),
                (0, $e33bd269540e00fa$export$23931e6715d4c9e2)(this.hass, this._periodStart, this._periodEnd, statisticIds, statsPeriod, undefined, statTypes)
            ]);
            if (fetchId !== this._activeFetch) return;
            const metadata = {};
            metadataArray.forEach((item)=>{
                metadata[item.statistic_id] = item;
            });
            this._metadata = metadata;
            this._statistics = statistics;
        } catch (error) {
            if (fetchId === this._activeFetch) {
                console.error("[energy-custom-graph-card] Failed to load statistics", error);
                this._metadata = undefined;
                this._statistics = undefined;
            }
        } finally{
            if (fetchId === this._activeFetch && loadingAtStart) this._isLoading = false;
        }
    }
    _determineStatisticsPeriod(start, end) {
        const effectiveEnd = end ?? new Date();
        const dayDifference = Math.max((0, $37435ba8bd527020$export$2e2bcd8739ae039)(effectiveEnd, start), 0);
        if (dayDifference > 35) return "month";
        if (dayDifference > 2) return "day";
        return "hour";
    }
    static getStubConfig() {
        return {
            type: "energy-custom-graph-card",
            series: []
        };
    }
    setConfig(config) {
        if (!config.series || !Array.isArray(config.series) || !config.series.length) throw new Error("At least one series must be configured");
        config.series.forEach((series, index)=>{
            if (!series || !series.statistic_id) throw new Error(`Series at index ${index} is missing a statistic_id`);
        });
        const oldConfig = this._config;
        this._config = {
            ...config,
            energy_date_selection: config.energy_date_selection !== undefined ? config.energy_date_selection : true,
            period: config.period ?? $c4fa7deb39259653$var$DEFAULT_PERIOD
        };
        this._loggedEnergyFallback = false;
        this.requestUpdate("_config", oldConfig);
        if (this.hass) this._syncWithConfig(oldConfig);
    }
    updated(changedProps) {
        if (changedProps.has("_statistics") || changedProps.has("_metadata") || changedProps.has("_periodStart") || changedProps.has("_periodEnd") || changedProps.has("_config")) this._generateChart();
    }
    getCardSize() {
        return 5;
    }
    render() {
        if (!this.hass || !this._config) return 0, $f156c5f18ecaaf3f$export$45b790e32b2810ee;
        return (0, $f156c5f18ecaaf3f$export$c0bb0b647f701bb5)`
      <ha-card>
        ${this._config.title ? (0, $f156c5f18ecaaf3f$export$c0bb0b647f701bb5)`<h1 class="card-header">${this._config.title}</h1>` : (0, $f156c5f18ecaaf3f$export$45b790e32b2810ee)}
        <div class="content">
          ${this._renderChart()}
        </div>
      </ha-card>
    `;
    }
    _renderChart() {
        if (this._isLoading) return (0, $f156c5f18ecaaf3f$export$c0bb0b647f701bb5)`<div class="placeholder">
        ${this.hass.localize?.("ui.components.statistics_charts.loading_statistics") ?? "Loading statistics\u2026"}
      </div>`;
        const hasData = this._chartData.some((series)=>{
            if (!Array.isArray(series.data)) return false;
            return series.data.some((point)=>{
                if (point === null || point === undefined) return false;
                if (Array.isArray(point)) return point[1] !== null && point[1] !== undefined;
                if (typeof point === "object" && Array.isArray(point.value)) return point.value[1] !== null && point.value[1] !== undefined;
                return false;
            });
        });
        if (!hasData || !this._chartOptions) return (0, $f156c5f18ecaaf3f$export$c0bb0b647f701bb5)`<div class="placeholder">
        ${this.hass.localize?.("ui.components.statistics_charts.no_statistics_found") ?? "No statistics available for the selected period"}
      </div>`;
        return (0, $f156c5f18ecaaf3f$export$c0bb0b647f701bb5)`
      <div class="chart">
        <ha-chart-base
          .hass=${this.hass}
          .data=${this._chartData}
          .options=${this._chartOptions}
          .height=${this._config?.chart_height}
          .expandLegend=${this._config?.expand_legend}
        ></ha-chart-base>
      </div>
    `;
    }
    _generateChart() {
        if (!this._config || !this._statistics || !this._periodStart) {
            this._chartData = [];
            this._chartOptions = undefined;
            this._unitsBySeries = new Map();
            return;
        }
        const computedStyle = this.isConnected ? getComputedStyle(this) : getComputedStyle(document.documentElement);
        const { series: series, legend: legend, unitBySeries: unitBySeries, seriesById: seriesById } = (0, $834b6972c14ca89a$export$ac226b8a7831eaf7)({
            hass: this.hass,
            statistics: this._statistics,
            metadata: this._metadata,
            configSeries: this._config.series,
            colorPalette: this._config.color_cycle ?? [],
            computedStyle: computedStyle
        });
        this._applyBarStyling(series);
        if (!series.length) {
            this._chartData = [];
            this._chartOptions = undefined;
            this._unitsBySeries = new Map();
            return;
        }
        const { yAxis: yAxis, axisUnitByIndex: axisUnitByIndex } = this._buildYAxisOptions(seriesById);
        this._unitsBySeries = new Map();
        series.forEach((item)=>{
            const axisIndex = item.yAxisIndex ?? 0;
            const axisUnit = axisUnitByIndex.get(axisIndex) ?? (this._config.show_unit === false ? undefined : unitBySeries.get(item.id ?? ""));
            this._unitsBySeries.set(item.id ?? "", axisUnit);
        });
        const legendOption = this._buildLegendOption(legend);
        const axisMax = this._periodEnd ? this._computeSuggestedXAxisMax(this._periodStart, this._periodEnd) : (this._periodEnd ?? new Date()).getTime();
        const xAxis = [
            {
                id: "primary",
                type: "time",
                min: this._periodStart,
                max: axisMax
            },
            {
                id: "secondary",
                type: "time",
                show: false
            }
        ];
        const tooltipFormatter = (params)=>this._renderTooltip(params);
        const options = {
            xAxis: xAxis,
            yAxis: yAxis,
            grid: {
                top: 15,
                left: 1,
                right: 1,
                bottom: 0,
                containLabel: true
            },
            tooltip: {
                trigger: "axis",
                appendTo: document.body,
                formatter: tooltipFormatter,
                axisPointer: {
                    type: "cross"
                }
            }
        };
        if (legendOption) options.legend = legendOption;
        this._chartData = series;
        this._chartOptions = options;
    }
    _computeSuggestedXAxisMax(start, end) {
        const dayDifference = (0, $37435ba8bd527020$export$2e2bcd8739ae039)(end, start);
        let suggestedMax = new Date(end);
        if (dayDifference > 2 && suggestedMax.getHours() === 0) suggestedMax = (0, $94dea91cc169b2bc$export$2e2bcd8739ae039)(suggestedMax, 1);
        suggestedMax.setMinutes(0, 0, 0);
        if (dayDifference > 35) suggestedMax.setDate(1);
        if (dayDifference > 2) suggestedMax.setHours(0);
        return suggestedMax.getTime();
    }
    _applyBarStyling(series) {
        const barSeries = series.filter((item)=>item.type === "bar");
        if (!barSeries.length) return;
        const bucketSet = new Set();
        barSeries.forEach((serie)=>{
            if (!Array.isArray(serie.data)) return;
            serie.data = serie.data.map((entry)=>{
                if (Array.isArray(entry)) {
                    bucketSet.add(Number(entry[0]));
                    return {
                        value: [
                            entry[0],
                            entry[1]
                        ]
                    };
                }
                if (entry && typeof entry === "object" && "value" in entry) {
                    const tuple = Array.isArray(entry.value) ? entry.value : undefined;
                    if (tuple) {
                        bucketSet.add(Number(tuple[0]));
                        return {
                            ...entry,
                            value: [
                                tuple[0],
                                tuple[1]
                            ]
                        };
                    }
                    return {
                        ...entry
                    };
                }
                return {
                    value: [
                        entry,
                        0
                    ]
                };
            });
        });
        const buckets = Array.from(bucketSet).sort((a, b)=>a - b);
        barSeries.forEach((serie, serieIndex)=>{
            const baseItemStyle = {
                ...serie.itemStyle ?? {}
            };
            const dataMap = new Map();
            serie.data?.forEach((item)=>{
                const tuple = Array.isArray(item?.value) ? item.value : undefined;
                if (!tuple) return;
                dataMap.set(Number(tuple[0]), {
                    ...item,
                    value: [
                        tuple[0],
                        tuple[1]
                    ],
                    itemStyle: {
                        ...baseItemStyle,
                        ...item.itemStyle ?? {}
                    }
                });
            });
            serie.data = buckets.map((bucket)=>{
                const existing = dataMap.get(bucket);
                if (existing) return existing;
                return {
                    value: [
                        bucket,
                        0
                    ],
                    itemStyle: {
                        ...baseItemStyle,
                        borderWidth: 0,
                        borderRadius: [
                            0,
                            0,
                            0,
                            0
                        ]
                    }
                };
            });
            // Ensure series color applies to default item style as well.
            serie.itemStyle = {
                ...baseItemStyle
            };
            serie.barMaxWidth = serie.barMaxWidth ?? (0, $834b6972c14ca89a$export$7372184653ac2416);
        });
        buckets.forEach((_bucket, bucketIndex)=>{
            const roundedPositive = new Set();
            const roundedNegative = new Set();
            for(let idx = barSeries.length - 1; idx >= 0; idx--){
                const serie = barSeries[idx];
                const dataItem = serie.data[bucketIndex];
                const tuple = Array.isArray(dataItem?.value) ? dataItem.value : undefined;
                const value = tuple ? Number(tuple[1] ?? 0) : 0;
                const stackKey = serie.stack ?? `__stack_${idx}`;
                const itemStyle = {
                    ...serie.itemStyle ?? {},
                    ...dataItem?.itemStyle ?? {}
                };
                if (!tuple) continue;
                if (!Array.isArray(itemStyle.borderRadius)) itemStyle.borderRadius = [
                    0,
                    0,
                    0,
                    0
                ];
                if (!value) {
                    itemStyle.borderWidth = 0;
                    itemStyle.borderRadius = [
                        0,
                        0,
                        0,
                        0
                    ];
                    dataItem.itemStyle = itemStyle;
                    continue;
                }
                itemStyle.borderWidth = (0, $834b6972c14ca89a$export$73697d51fea399c1);
                if (value > 0) {
                    if (!roundedPositive.has(stackKey)) {
                        itemStyle.borderRadius = [
                            4,
                            4,
                            0,
                            0
                        ];
                        roundedPositive.add(stackKey);
                    } else itemStyle.borderRadius = [
                        0,
                        0,
                        0,
                        0
                    ];
                } else if (value < 0) {
                    if (!roundedNegative.has(stackKey)) {
                        itemStyle.borderRadius = [
                            0,
                            0,
                            4,
                            4
                        ];
                        roundedNegative.add(stackKey);
                    } else itemStyle.borderRadius = [
                        0,
                        0,
                        0,
                        0
                    ];
                }
                dataItem.itemStyle = itemStyle;
                serie.data[bucketIndex] = dataItem;
            }
        });
    }
    _buildLegendOption(entries) {
        if (!entries.length) return undefined;
        const sort = this._config?.legend_sort ?? "none";
        const sortedEntries = [
            ...entries
        ];
        if (sort === "asc" || sort === "desc") sortedEntries.sort((a, b)=>{
            const compare = a.name.localeCompare(b.name);
            return sort === "asc" ? compare : -compare;
        });
        const data = sortedEntries.map((entry)=>({
                id: entry.id,
                name: entry.name,
                itemStyle: entry.color ? {
                    color: entry.color
                } : undefined
            }));
        const selected = {};
        sortedEntries.forEach((entry)=>{
            selected[entry.id] = entry.hidden ? false : true;
        });
        return {
            type: "custom",
            show: !this._config?.hide_legend,
            data: data,
            selected: selected
        };
    }
    _buildYAxisOptions(seriesById) {
        const axisConfigs = this._config?.y_axes ?? [];
        const leftConfig = axisConfigs.find((axis)=>axis.id === "left");
        const rightConfig = axisConfigs.find((axis)=>axis.id === "right");
        const usesRight = !!rightConfig || Array.from(seriesById.values()).some((series)=>series.y_axis === "right");
        const axisUnitByIndex = new Map();
        const yAxis = [];
        const createAxis = (axisConfig, index)=>{
            const fit = axisConfig?.fit_y_data ?? this._config?.fit_y_data ?? false;
            const logarithmic = axisConfig?.logarithmic_scale ?? this._config?.logarithmic_scale ?? false;
            axisUnitByIndex.set(index, axisConfig?.unit);
            return {
                type: logarithmic ? "log" : "value",
                name: axisConfig?.unit,
                nameGap: axisConfig?.unit ? 2 : 0,
                nameTextStyle: {
                    align: "left"
                },
                position: index === 0 ? "left" : "right",
                min: axisConfig?.min,
                max: axisConfig?.max,
                splitLine: {
                    show: true
                },
                axisLabel: {
                    formatter: (value)=>this._formatNumber(value)
                },
                scale: fit
            };
        };
        yAxis.push(createAxis(leftConfig, 0));
        if (usesRight) yAxis.push(createAxis(rightConfig, 1));
        return {
            yAxis: yAxis,
            axisUnitByIndex: axisUnitByIndex
        };
    }
    _renderTooltip(params) {
        if (!Array.isArray(params) || !params.length) return "";
        const items = params;
        const extractTuple = (param)=>{
            const value = param.value ?? param.data ?? param?.value?.value;
            if (Array.isArray(value)) {
                const x = value[0];
                const y = value[value.length - 1];
                return [
                    x,
                    typeof y === "number" ? y : null
                ];
            }
            if (typeof value === "number") return [
                param.axisValue ?? param.axisValueLabel ?? 0,
                value
            ];
            if (value && Array.isArray(value.value)) {
                const tuple = value.value;
                const x = tuple[0];
                const y = tuple[tuple.length - 1];
                return [
                    x,
                    typeof y === "number" ? y : null
                ];
            }
            return undefined;
        };
        const firstTuple = extractTuple(items[0]);
        const header = firstTuple ? `${this._formatDateTime(new Date(firstTuple[0]))}<br>` : "";
        const precision = this._config?.tooltip_precision ?? 2;
        const rendered = new Set();
        const lines = items.map((item, index)=>{
            const seriesKey = String(item.seriesId ?? item.seriesIndex ?? item.seriesName ?? index);
            if (rendered.has(seriesKey)) return "";
            rendered.add(seriesKey);
            const tuple = extractTuple(item);
            const value = tuple?.[1];
            if (value === null || value === undefined || Number.isNaN(value)) return "";
            const unit = this._config?.show_unit === false ? undefined : this._unitsBySeries.get(seriesKey);
            const formattedValue = this._formatNumber(value, {
                maximumFractionDigits: precision
            });
            const unitLabel = unit ? ` ${unit}` : "";
            const marker = typeof item.marker === "string" ? item.marker : item.color ? `<span style="display:inline-block;margin-right:4px;border-radius:50%;width:8px;height:8px;background:${item.color}"></span>` : "";
            return `${marker} ${item.seriesName ?? ""}: ${formattedValue}${unitLabel}`;
        }).filter(Boolean);
        if (!lines.length) return header || "";
        return `${header}${lines.join("<br>")}`;
    }
    _formatNumber(value, options) {
        const locale = this.hass?.locale?.language ?? "en-US";
        const numberFormat = new Intl.NumberFormat(locale, {
            maximumFractionDigits: 2,
            ...options
        });
        return numberFormat.format(value);
    }
    _formatDateTime(date) {
        const locale = this.hass?.locale?.language ?? "en-US";
        const localeInfo = this.hass?.locale;
        let timeZone = localeInfo?.time_zone;
        if (timeZone === "server") timeZone = this.hass?.config?.time_zone;
        if (!timeZone || timeZone === "local" || timeZone === "system") timeZone = undefined;
        try {
            return new Intl.DateTimeFormat(locale, {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
                timeZone: timeZone
            }).format(date);
        } catch (// eslint-disable-next-line @typescript-eslint/no-unused-vars
        _error) {
            return date.toLocaleString();
        }
    }
    static{
        this.styles = (0, $b79cab361f081c93$export$dbf350e5966cf602)`
    ha-card {
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .card-header {
      margin: 0;
      padding: 16px;
    }

    .content {
      flex: 1;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      min-height: 0;
    }

    .chart {
      flex: 1;
      min-height: 0;
    }

    .placeholder {
      color: var(--secondary-text-color);
      font-style: italic;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      text-align: center;
      padding: 16px 8px;
    }
  `;
    }
    constructor(...args){
        super(...args), this._isLoading = false, this._chartData = [], this._activeFetch = 0, this._unitsBySeries = new Map(), this._loggedEnergyFallback = false;
    }
}
(0, $24c52f343453d62d$export$29e00dfd3077644b)([
    (0, $8fbcd235ba38df66$export$d541bacb2bda4494)({
        attribute: false
    })
], $c4fa7deb39259653$export$535692f6ec92be60.prototype, "hass", void 0);
(0, $24c52f343453d62d$export$29e00dfd3077644b)([
    (0, $d728c145a8b96d94$export$ca000e230c0caa3e)()
], $c4fa7deb39259653$export$535692f6ec92be60.prototype, "_config", void 0);
(0, $24c52f343453d62d$export$29e00dfd3077644b)([
    (0, $d728c145a8b96d94$export$ca000e230c0caa3e)()
], $c4fa7deb39259653$export$535692f6ec92be60.prototype, "_statistics", void 0);
(0, $24c52f343453d62d$export$29e00dfd3077644b)([
    (0, $d728c145a8b96d94$export$ca000e230c0caa3e)()
], $c4fa7deb39259653$export$535692f6ec92be60.prototype, "_metadata", void 0);
(0, $24c52f343453d62d$export$29e00dfd3077644b)([
    (0, $d728c145a8b96d94$export$ca000e230c0caa3e)()
], $c4fa7deb39259653$export$535692f6ec92be60.prototype, "_periodStart", void 0);
(0, $24c52f343453d62d$export$29e00dfd3077644b)([
    (0, $d728c145a8b96d94$export$ca000e230c0caa3e)()
], $c4fa7deb39259653$export$535692f6ec92be60.prototype, "_periodEnd", void 0);
(0, $24c52f343453d62d$export$29e00dfd3077644b)([
    (0, $d728c145a8b96d94$export$ca000e230c0caa3e)()
], $c4fa7deb39259653$export$535692f6ec92be60.prototype, "_isLoading", void 0);
(0, $24c52f343453d62d$export$29e00dfd3077644b)([
    (0, $d728c145a8b96d94$export$ca000e230c0caa3e)()
], $c4fa7deb39259653$export$535692f6ec92be60.prototype, "_chartData", void 0);
(0, $24c52f343453d62d$export$29e00dfd3077644b)([
    (0, $d728c145a8b96d94$export$ca000e230c0caa3e)()
], $c4fa7deb39259653$export$535692f6ec92be60.prototype, "_chartOptions", void 0);
$c4fa7deb39259653$export$535692f6ec92be60 = (0, $24c52f343453d62d$export$29e00dfd3077644b)([
    (0, $8e719a98b1b15d5f$export$da64fc29f17f9d0e)("energy-custom-graph-card")
], $c4fa7deb39259653$export$535692f6ec92be60);


window.customCards = window.customCards || [];
window.customCards.push({
    type: "energy-custom-graph-card",
    name: "Energy Custom Graph",
    description: "Flexible energy statistics chart with custom stacking, axes, and colors."
});


//# sourceMappingURL=energycustomgraph.js.map
