import Vue from 'vue'
import lowdb from 'lowdb'
import LocalStorage from 'lowdb/adapters/LocalStorage'
import cryptoRandomString from 'crypto-random-string'
import _find from 'lodash/find'
import _assign from 'lodash/assign'
import _cloneDeep from 'lodash/cloneDeep'
import _findIndex from 'lodash/findIndex'
import _forEachRight from 'lodash/forEachRight'

export default {
  // 독립적 관리를 위해 namespaced: true
  namespaced: true,
  // 참조 관계로 인한 데이터 변경 방지를 위해 함수 형태로 리턴
  // data와 같은 함수
  // arrow function으로 ()안의 {}리턴
  state: () => ({
    db: null,
    todos: [],
    filter: 'all'
  }),
  // Computed 역할
  getters: {
    filteredTodos (state) {
      switch (state.filter) {
        case 'all':
        default:
          return state.todos
        case 'active': // 해야 할 항목
          return state.todos.filter(todo => !todo.done)
        case 'completed': // 완료된 항목
          return state.todos.filter(todo => todo.done)
      }
    },
    total (state) {
      return state.todos.length
    },
    activeCount (state) {
      return state.todos.filter(todo => !todo.done).length
    },
    completedCount (state, getters) {
      return getters.total - getters.activeCount
    }
  },
  // Methods 역할
  // 실제 값을 변경할 때 (비동기 처리 안됨), 데이터 변경 가능
  mutations: {
    // mutations에서는 context의 state를 {} 없이 접근 가능
    assignDB (state, db) {
      state.db = db
    },
    createDB (state, newTodo) {
      // Create DB
      state.db
        .get('todos') // lodash
        .push(newTodo) // lodash
        .write() // lowdb
    },
    // { todo, value } : 객체가 인자값으로 전달 되는데 바로 사용 값을 설정할 수 있다.
    updateDB (state, { todo, value }) {
      // Update DB
      state.db
        .get('todos')
        .find({ id: todo.id })
        .assign(value) // 갱신
        .write()
    },
    deleteDB (state, todo) {
      // Delete DB
      state.db
        .get('todos')
        .remove({ id: todo.id })
        .write()
    },
    assignTodos (state, todos) {
      state.todos = todos
    },
    pushTodo (state, newTodo) {
      // Create Client (화면 갱신)
      state.todos.push(newTodo)
    },
    assignTodo (state, { foundTodo, value }) {
      _assign(foundTodo, value)
    },
    deleteTodo (state, foundIndex) {
      // this.$delete(state.todos, foundIndex)와 같은 코드이다.
      // 여기서는 this를 사용할 수 없기 때문에 아래와 같이 사용한다.
      Vue.delete(state.todos, foundIndex)
    },
    updateTodo (state, { todo, key, value }) {
      todo[key] = value
    },
    updateFilter (state, filter) {
      state.filter = filter
    }
  },

  // Methods
  // 일반 로직 (비동기 처리 가능), 데이터 변경 안됨, 데이터 변경 시 mutations의 도움 필요
  actions: {
    // { state } : context가 넘어 오고 context안의 state를 사용하겠다는 의미
    // commit을 통해서 mutations에 접근
    initDB ({ state, commit }) {
      const adapter = new LocalStorage('todo-app')
      // state.db = lowdb(adapter)
      // commit으로 mutations의 assignDB 메소드 실행, lowdb(adapter)를 인자로 전달
      commit('assignDB', lowdb(adapter))

      // todos 배열에서 값을 가져온다.
      const hasTodos = state.db.has('todos').value()

      if (hasTodos) {
        // 값이 있으면 todos 배열에 값을 저장
        // lodash읙 cloneDeep을 이용하여 깊은 복사를 진행한다.
        // 그냥 복사 시 참조 복사가 되어 원본 데이터에 영향을 주게된다.
        // state.todos = _cloneDeep(state.db.getState().todos)
        commit('assignTodos', _cloneDeep(state.db.getState().todos))
      } else {
        // 값이 없으면 Local DB 초기화
        state.db
          .defaults({
            todos: [] // Collection, 배열명 설정
          })
          .write()
      }
    },
    createTodo ({ state, commit }, title) {
      const newTodo = {
        id: cryptoRandomString({ length: 10 }),
        title: title,
        createdAt: new Date(),
        updatedAt: new Date(),
        done: false
      }

      // Create DB
      // commit으로 mutations의 createDB 호출, newTodo 인자값 전달
      commit('createDB', newTodo)

      // Create Client (화면 갱신)
      // commit으로 mutations의 pushTodo 호출, newTodo 인자값 전달
      commit('pushTodo', newTodo)
    },
    // { todo, value } : 객체가 인자값으로 전달 되는데 바로 사용 값을 설정할 수 있다.
    // 인자가 여러개 일때 호출하는 쪽에서 객체 형태로 전달하면 된다.
    updateTodo ({ state, commit }, { todo, value }) {
      // Update DB
      commit('updateDB', { todo, value })

      // 화면 갱신
      const foundTodo = _find(state.todos, { id: todo.id })
      commit('assignTodo', { foundTodo, value })
    },
    deleteTodo ({ state, commit }, todo) {
      // Delete DB
      commit('deleteDB', todo)

      // 화면 갱신
      const foundIndex = _findIndex(state.todos, { id: todo.id })

      // Delete Client
      commit('deleteTodo', foundIndex)
    },
    completeAll ({ state, commit }, checked) {
      // mutations에서는 값을 리턴할 수 없기 때문에 아래 코드 중에서
      // mutations에서 사용할 수 있는것만 사용
      const newTodos = state.db
        .get('todos')
        .forEach(todo => {
          // todo.done = checked
          commit('updateTodo', {
            todo: todo,
            key: 'done',
            value: checked
          })
        })
        .write()

      // this.todos.forEach(todo => {
      //    todo.done =checked
      // })
      // state.todos = _cloneDeep(newTodos)
      commit('assignTodos', _cloneDeep(newTodos))
    },
    // actions에 있는 메소드를 사용하기 위해 dispatch를 사용
    clearCompleted ({ state, dispatch }) {
      /*
            this.todos.forEach(todo => {
                if(todo.done) {
                    this.deleteTodo(todo)
                }
            })
            */

      /*
            배열을 삭제할 때는 뒤에서 부터 삭제하는 것이 안전하다.
            this.todos
                .reduce((list, todo, index) => {
                    if(todo.done) {
                        list.push(index)
                    }
                    return list
                }, [])
                .reverse()
                .forEach(index => {
                    this.deleteTodo(this.todos[index])
                })
            */

      _forEachRight(state.todos, todo => {
        if (todo.done) {
          // this.deleteTodo(todo)
          // actions에 있는 메소드를 사용하기 위해 dispatch를 사용
          dispatch('deleteTodo', todo)
        }
      })
    }
  }
}
