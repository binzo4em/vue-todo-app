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
                v-bind:todo="todo"/>
        </div>

        <!-- TodoCreator -->
        <TodoCreator class="todo-app__creator"/>
    </div>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import scrollTo from 'scroll-to'

// import components
import TodoCreator from '@/components/TodoCreator'
import TodoItem from '@/components/TodoItem'

export default {
  components: {
    TodoCreator,
    TodoItem
  },
  computed: {
    // ... : 전개 연산자, mapState, mapGetters를 helpers라고 한다.
    // todoApp : namespace, []에는 가져올 값을 나열
    // index.js에서 modules에 todoApp을 선언하였기 때문에 namespace를 사용해야 한다.
    // index.js에 선언한 함수를 가져올 때는 namespace를 생략할 수 있다.
    // namespace를 사용하지 않으면 index.js에서 찾게된다.
    // 첫번째 인수 : namespace, 두번째 인수 : []에 store의 state를 작성
    ...mapState('todoApp', [
      'todos'
    ]),
    // 첫번째 인수 : namespace, 두번째 인수 : []에 store의 getters를 작성
    ...mapGetters('todoApp', [
      'filteredTodos',
      'total',
      'activeCount',
      'completedCount'
    ]),
    allDone: {
      get () {
        return this.total === this.completedCount && this.total > 0
      },
      set (checked) {
        this.completeAll(checked)
      }
    }
  },
  // $route 감시, $route가 변경되면 정의한 함수 실행
  //
  watch: {
    $route () {
      // state.filter = this.$route.params.id
      // this.$store.commit('todoApp/updateFilter', this.$route.params.id)
      this.updateFilter(this.$route.params.id) // helpers 이용
    }
  },
  created () {
    // 라이프 사이클, TodoApp 컴포넌트가 생성된 직후
    this.initDB()
    // dispatch : store의 actions에 접근할 때 사용
    // todoApp/updateTodo : namespace로 todoApp에 있는 updateTodo 호출
    // 인자값을 1개만 전달할 수 있기 때문에 객체 여러개의 인자값 전달 시 객체 형태로 리턴해야 함
    /*
        this.$store.dispatch('todoApp/updateTodo', {
            todo: todo,
            value: value
        })
        */
  },
  methods: {
    ...mapMutations('todoApp', [
      'updateFilter'
    ]),
    // todoApp : namespace
    ...mapActions('todoApp', [
      'initDB',
      'completeAll',
      'clearCompleted'
    ]),
    scrollToTop () {
      scrollTo(0, 0, {
        ease: 'linear'
      })
    },
    scrollToBottom () {
      scrollTo(0, document.body.scrollHeight, {
        ease: 'linear'
      })
    }
  }
}
</script>

<style lang="scss">
    /* ~@는 루트 디렉토리(src)를 나타낸다. */
   @import "~@/scss/style";

   .filters button.router-link-active {
        background: royalblue;
        color: white;
    }
</style>
