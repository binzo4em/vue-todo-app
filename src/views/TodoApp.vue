<template>
    <div class="todo-app">
        <!-- Uppper Menu -->
        <div class="todo-app__actions">
            <div class="filters">
                <!-- filter가 all인 경우에만 active라는 class를 부여 -->
                <router-link
                    to="all"
                    tag="button">
                    모든 항목 ({{ total }})
                </router-link>
                <router-link
                    to="active"
                    tag="button">
                    해야 할 항목 ({{ activeCount }})
                </router-link>
                <router-link
                    to="completed"
                    tag="button">
                    완료된 항목 ({{ completedCount }})
                </router-link>
            </div>

            <div class="actions clearfix">
                <div class="float--left">
                    <label>
                        <input v-model="allDone" type="checkbox">
                        <span class="icon"><i class="material-icons">done_all</i></span>
                    </label>
                </div>
                <div class="float--right clearfix">
                    <button class="btn float--left" v-on:click="scrollToTop"> 
                        <i class="material-icons">expand_less</i>
                    </button>
                    <button class="btn float--left" v-on:click="scrollToBottom">
                        <i class="material-icons">expand_more</i>
                    </button>
                    <button class="btn btn--danger float--left" v-on:click="clearCompleted">
                        <i class="material-icons">delete_sweep</i>
                    </button>
                </div>
            </div>
        </div>

        <!-- TodoItem -->
        <!-- 
            상단 버튼을 클릭할때마다 아이템을 다시 출력하기 위해 
            computed에 정의한 filteredTodos를 v-for에 사용
         -->
        <div class="todo-app__list">
            <TodoItem
                v-for="todo in filteredTodos"
                v-bind:key="todo.id"
                v-bind:todo="todo"
                v-on:update-todo="updateTodo"
                v-on:delete-todo="deleteTodo"
            />
        </div>

        <!-- TodoCreator -->
        <TodoCreator 
            class="todo-app__creator"
            v-on:create-todo="createTodo"/>
    </div>
</template>

<script>
// import lowdb and lodash libraries
import lowdb from 'lowdb'
import LocalStorage from 'lowdb/adapters/LocalStorage'
import cryptoRandomString from 'crypto-random-string' // 랜덤 문자열 생성기
import _cloneDeep from 'lodash/cloneDeep' // Lodash의 메소드임을 표시하기 위해 _(언더바) 사용
import _find from 'lodash/find'
import _assign from 'lodash/assign'
import _findIndex from 'lodash/findIndex'
import _forEachRight from 'lodash/forEachRight'

// 스크롤 바를 위, 아래로 이동 시키는 라이브러리
import scrollTo from 'scroll-to'

// import components
import TodoCreator from '@/components/TodoCreator'
import TodoItem from '@/components/TodoItem'

export default {
    // 사용할 컴포넌트 등록
    components: {
        TodoCreator,
        TodoItem
    },
    // data 속성은 함수 형태로 return 할 것
    data() {
        return {
            db: null,
            todos: [],
        }
    },
    computed: {
        /*
         * data 속성에서 filter: 'all'로 설정하였기 때문에 처음 실행 시 한번 호출된다. 
         * filter 값이 변경 되면 filteredTodos가 호출된다.
         */
        filteredTodos() {
            switch(this.$route.params.id) {
                // all과 default의 내용이 동일한 경우 아래와 같이 묶어서 작성해도 된다.
                case 'all':
                default:
                    return this.todos
                case 'active': // 해야 할 항목
                    return this.todos.filter(todo => !todo.done) // todo.done이 false인 것을 return
                case 'completed': // 완료된 항목
                    return this.todos.filter(todo => todo.done)
            }
        },
        total() {
            return this.todos.length
        },
        activeCount() { // 해야 할 항목 개수
            return this.todos.filter(todo => !todo.done).length
        },
        completedCount() {
            return this.total - this.activeCount
        },
        allDone: {
            get() {
                // 전체가 선택된 경우, 아이템이 있을 때만 true를 리턴
                return this.total === this.completedCount && this.total > 0
            },
            set(checked) {
                this.completeAll(checked)
            }
        }
    },
    created() {
        this.initDB()
    },
    methods: {
        initDB() {
            // todo-app : LocalStorage의 key 이름
            // lowdb로 LocalStorage를 사용하기 위해서 adapter를 사용해야 한다.
            const adapter = new LocalStorage('todo-app')
            this.db = lowdb(adapter)

            console.log(this.db)

            // has : Lodash 제공
            // todos 데이터가 있는지 확인
            const hasTodos = this.db.has('todos').value()

            if(hasTodos) {
                /**
                 * 데이터가 있으면 가져온다.
                 * 원격의 DB에서 데이터를 가져오는 효과를 내기위해 깊은 복사를 통해 가져온다. 
                 * 깊은 복사는 참조관계가 형성되지 않는다.
                 * 실제의 경우 원격 DB에서 데이터를 가져오고 중간 어디에선가 복사를 통해 데이터를 가져오게 된다.
                 * 그냥 가져오게 되면 참조관계가 있기 때문에 원본에 영향을 준다.
                 */
                // 데이터가 있으면 가져온다.
               
                this.todos = _cloneDeep(this.db.getState().todos)
            }else {
                // 데이터가 없으면 초기화
                // Local DB 초기화
                this.db
                    .defaults({
                        todos: [] // 속성 정의
                    })
                    .write()
            }

        },
        // Localdb에 데이터 추가
        createTodo(title) {
            const newTodo = {
                id: cryptoRandomString({ length: 10 }),
                title: title,
                createdAt: new Date(),
                updatedAt: new Date(),
                done: false
            }

            // Create DB, 원격지 데이터베이스에 추가하는 것으로 가정
            this.db
                .get('todos') // lodash 제공
                .push(newTodo) // lodash 제공
                .write() // Lowdb 제공

            // Create Client, 깊은 복사를 통해 데이터를 사용중으로 클라이언트에서 반영해야 한다.
            // 이것은 로컬에서 원격지 DB와 통신하는 것을 가정으로 하는 것이기 때문이다.
            this.todos.push(newTodo)
        },
        updateTodo(todo, value) {
            this.db
                .get('todos')
                .find({ id: todo.id }) // lodash 제공
                .assign(value) // lodash 제공
                .write()
            
            // Create Client, 깊은 복사를 통해 데이터를 사용중으로 클라이언트에서 반영해야 한다.
            // 이것은 로컬에서 원격지 DB와 통신하는 것을 가정으로 하는 것이기 때문이다.
            const foundTodo = _find(this.todos, { id: todo.id })
            _assign(foundTodo, value) // todos 객체에 병합
            
        },
        deleteTodo(todo) {
            this.db
                .get('todos')
                .remove({ id: todo.id }) // lodash 제공
                .write() // lowdb

            const foundIndex = _findIndex(this.todos, { id: todo.id })
            // 객체 속성을 삭제, 데이터가 반응성을 가지고 있으면 화면을 갱신한다.
            this.$delete(this.todos, foundIndex)
        },
        completeAll(checked) {
            // DB 갱신
            // 수정된 DB 객체를 newTodos에 저장하여 Local DB 갱신에 사용
            const newTodos = this.db
                .get('todos')
                .forEach(todo => {
                    todo.done = checked
                })
                .write()
            
            /**
             * Local todos 갱신
             * 1. 아래와 같이 기존 todos를 수정하는 방법
             * 2. 작업 후 반환된 객체 자체를 할당하여 갱신하는 방법
             *     - 반환된 객체는 참조관계가 있기 때문에 깊은 복사를 통해 기존 객체에 할당해야 함
             */

            // this.todos.forEach(todo => {
            //     todo.done = checked
            // })

            // 참조 관계로 인해 원본 DB에 영향을 주지않기 위해 깊은 복사를 통해 Local DB를 갱신한다.
            this.todos = _cloneDeep(newTodos)
        },
        clearCompleted() {
            /**
             * 반목문을 통해서 배열의 아템 삭제 시 뒤에서부터 삭제를 해야한다.
             * 앞에서부터 삭제하는 경우 아이템이 삭제된 후 뒤에 아이템이 앞으로 밀리면서 타이밍 문제로 인해
             * 정상적으로 동작하지 않을 수 있기 때문에 반복문을 이용한 삭제 시 뒤에서부터 삭제해야 한다.
             * 
             * 아래 코드는 앞에서부터 삭제하는 것으로 원하는대로 동작하지 않는다.
                this.todos.forEach(todo => {
                    if(todo.done) {
                        this.deleteTodo(todo)
                    }
                })

                라이브러리 없이 네이티브 방식을 이용하여 배열 뒤에서부터 아이템을 삭제하는 방법
                []는 list의 초기값을 설정
                지워야 할 인덱스만 저장하고, 인덱스를 reverse로 뒤집은 후 forEacn로 삭제하면 된다.
                this.todos.reduce((list, todo, index) => {
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

            // lodash 라이브러리를 사용하여 배열 뒤에서부터 삭제
            _forEachRight(this.todos, todo => {
                if(todo.done) {
                    this.deleteTodo(todo)
                }
            })
        },
        scrollToTop() {
            scrollTo(0, 0, {
                ease: 'linear', // linear : 일정하게 움직인다.
                duration: 1000 // 기본 1초이며 시간을 조절할 수 있다.
            })
        },
        scrollToBottom() {
            // document.body.scrollHeight : body의 높이 값
            scrollTo(0, document.body.scrollHeight, {
                ease: 'linear',
                duration: 1000
            })
        }
    }
 
}
</script>

<style lang="scss">
    /* alis 설정 확인 필요 */
   @import "../scss/style";

   .filters button.router-link-active {
        background: royalblue;
        color: white;
    }
</style>