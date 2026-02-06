/**
 * @name: emitter
 * @author: kahu4
 * @date: 2024-01-19 18:18
 * @description：事件派发、监听器
 * @update: 2024-01-19 18:18
 * */

class Emitter {
    lister = {}

    constructor() {
        this.lister = {}
    }

    on(name, func) {
        this.lister[name] ? this.lister[name].push(func) : this.lister[name] = [func];
    }

    emit(name, ...args) {
        if (!this.lister[name]) return
        this.lister[name].forEach(func => func(...args))
    }

    /**
     * 取消事件监听
     * @param name 事件名
     * @param func 可选，指定移除的回调；不传则移除该事件下所有回调
     */
    off(name, func) {
        if (!this.lister[name]) return
        if (!func) {
            // 不指定回调则清空该事件所有监听
            this.clear(name)
            return
        }
        // 按指定回调移除
        this.lister[name] = this.lister[name].filter(fn => fn !== func)
        if (this.lister[name].length === 0) {
            delete this.lister[name]
        }
    }

    clear(name) {
        this.lister[name] = []
    }

    clearAll() {
        this.lister = {}
    }
}


// 只暴露一个实例全局共用
export const emitter = new Emitter()
