<template>
  <div
    v-bind:class="{ done: done }"
    class="todo-item">
      <div v-if="isEditMode" class="item__inner item--edit">
        <input
          ref="titleInput"
          v-bind:value="editedTitle"
          type="text"
          v-on:input="editedTitle = $event.target.value"
          v-on:keypress.enter="editedTodo"
          v-on:keypress.esc="offEditedMode">
        <div class="item__actions">
            <!-- 아래 item__actions 부분과 구별을 하기 위해 key 속성에 유니크한 값을 설정 -->
            <button class="btn btn--primary" key="complete" v-on:click="editedTodo">
                <i class="material-icons">done</i>
            </button>
            <button class="btn" key="cancle" v-on:click="offEditMode">
                <i class="material-icons">clear</i>
            </button>
        </div>
      </div>
      <div v-else class="item__inner item--normal">
        <label>
            <input v-model="done" type="checkbox"/>
            <span class="icon"><i class="material-icons">check</i></span>
        </label>
        <div class="item__title-wrap">
            <div class="item__title">
                {{ todo.title }}
            </div>
            <div class="item__date">
                {{ date }}
            </div>
        </div>
        <div class="item__actions">
            <button class="btn" key="update" v-on:click="onEditMode">
                <i class="material-icons">edit</i>
            </button>
            <button class="btn btn--danger" key="delete" v-on:click="deleteTodo">
                <i class="material-icons">delete</i>
            </button>
        </div>
    </div>

  </div>
</template>

<script>
import dayjs from 'dayjs' // 날짜 관련 경량화 라이브러리

export default {
  // props를 통해 상위 부모에서 데이터를 가져온다.
  props: {
    todo: Object
  },
  data () {
    return {
      isEditMode: false,
      editedTitle: ''
    }
  },
  computed: {
    done: {
      get () { // 최초 생성 시 호출
        return this.todo.done
      },
      set (done) { // 체크박스 클릭 시 호출된다.
        this.updateTodo({
          done: done
        })
      }
    },
    date () {
      const date = dayjs(this.todo.createdAt)
      const isSame = date.isSame(this.todo.updatedAt)

      if (isSame) {
        return date.format('YYYY년 MM월 DD일')
      } else {
        return `${date.format('YYYY년 MM월 DD일')} (edited)`
      }
    }
  },
  methods: {
    editedTodo () {
      if (this.todo.title !== this.editedTitle) {
        this.updateTodo({
          title: this.editedTitle,
          updatedAt: new Date()
        })
      }

      this.offEditMode()
    },
    onEditMode () {
      this.isEditMode = true
      this.editedTitle = this.todo.title

      // HTML이 렌더링된 후에 실행될 수 있도록 nextTick을 사용
      // 렌더링이 완료된 후에 $refs로 HTML에 설정된 ref값을 찾을 수 있다.
      this.$nextTick(() => {
        this.$refs.titleInput.focus()
      })
    },
    offEditMode () {
      this.isEditMode = false
    },
    updateTodo (value) {
      // this.$emit('update-todo', this.todo, value)
      this.$store.dispatch('todoApp/updateTodo', {
        todo: this.todo,
        value: value
      })
    },
    deleteTodo () {
      // this.$emit('delete-todo', this.todo)
      this.$store.dispatch('todoApp/deleteTodo', this.todo)
    }
  }
}
</script>

// scoped : 현재 컴포넌트에서만 사용하겠다는 의미
// <style lang="scss" scoped>
//     .todo-item {
//         .item__inner {
//             display: flex;
//         }
//         .item__date {
//             font-size: 12px;
//         }
//         /* & : 상위 부모 요소를 의미하고 여기서는 todo-item을 의미한다.
//         &.done : 상위 부모 요소인 todo-item에 done 속성이 있는 경우를 의미한다. */
//         &.done {
//             .item__title {
//                 text-decoration: line-through;
//             }
//         }
//     }
// </style>
