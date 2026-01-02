<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-h2 font-bold">
          Category Management
        </h2>
        <p class="text-muted-foreground">
          Manage event categories
        </p>
      </div>
      <button
        class="btn-primary px-6 py-2"
        @click="openAddModal"
      >
        Add Category
      </button>
    </div>

    <!-- Categories Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="category in categories"
        :key="category.id"
        class="card hover:shadow-lg transition-shadow"
      >
        <div class="flex items-start justify-between mb-3">
          <div>
            <h4 class="text-h4 font-bold">
              {{ category.name }}
            </h4>
            <p class="text-muted-foreground text-sm">
              {{ category.events }} events
            </p>
          </div>
          <span class="text-2xl">{{ category.icon }}</span>
        </div>
        <p class="text-sm text-muted-foreground mb-4">
          {{ category.description }}
        </p>
        <div class="flex gap-2">
          <button
            v-if="!category.isDefault"
            class="btn-outline px-3 py-1 text-sm flex-1"
            @click="editCategory(category.id)"
          >
            Edit
          </button>
          <button
            v-if="!category.isDefault"
            class="btn-outline px-3 py-1 text-sm flex-1 hover:bg-muted text-foreground"
            @click="deleteCategory(category.id)"
          >
            Delete
          </button>
          <span v-else class="text-xs text-muted-foreground">Default category</span>
        </div>
      </div>
    </div>

    <!-- Add/Edit Category Modal -->
    <div
      v-if="showAddCategory"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    >
      <div class="card max-w-md w-full">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-h3 font-bold">
            {{ editingId ? 'Edit' : 'Add' }} Category
          </h3>
          <button
            class="text-2xl"
            @click="showAddCategory = false"
          >
            ✕
          </button>
        </div>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-2">Category Name</label>
            <input
              v-model="newCategory.name"
              type="text"
              placeholder="e.g., Music"
              class="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
            >
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Icon</label>
            <input
              v-model="newCategory.icon"
              type="text"
              placeholder="e.g., 🎵"
              class="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
            >
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Description</label>
            <textarea
              v-model="newCategory.description"
              placeholder="Category description..."
              rows="3"
              class="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
            />
          </div>
          <div class="flex gap-2">
            <button
              class="btn-primary flex-1"
              @click="saveCategory"
            >
              {{ editingId ? 'Update' : 'Add' }}
            </button>
            <button
              class="btn-outline flex-1"
              @click="showAddCategory = false"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { categoryService } from '@/services/categoryService'

const showAddCategory = ref(false)
const editingId = ref(null)
const loading = ref(false)
const saving = ref(false)
const categories = ref([])
const newCategory = ref({ name: '', icon: '', description: '' })

// Default/system categories from backend seeder (case-insensitive match)
const defaultCategoryNames = new Set([
  'music','theater & plays','comedy','film & cinema','art exhibition',
  'conference','workshop','seminar','networking','trade show',
  'sports','marathon & racing','fitness class','outdoor adventure',
  'food festival','wine tasting','cooking class',
  'tech meetup','webinar','startup pitch',
  'university lecture','book reading','language exchange',
  'festival','charity & fundraiser','volunteering','religious & spiritual',
  'kids activities','educational kids',
  'wellness retreat','health seminar',
  'club night','karaoke',
  'gaming tournament','board games','photography','gardening'
])

const resetForm = () => {
  newCategory.value = { name: '', icon: '', description: '' }
  editingId.value = null
}

const openAddModal = () => {
  resetForm()
  showAddCategory.value = true
}

const defaultIcon = (name = '') => {
  if (newCategory.value.icon) return newCategory.value.icon
  return '📂'
}

const fetchCategories = async () => {
  loading.value = true
  try {
    const data = await categoryService.getAllCategories()
    categories.value = (data || []).map(c => ({
      id: c.id,
      name: c.name,
      description: c.description || 'No description provided',
      icon: '📂', // backend does not store icon; keep UI consistent
      events: c.events || 0,
      isDefault: c.name ? defaultCategoryNames.has(c.name.toLowerCase()) : false,
    }))
  } catch (err) {
    alert(err.response?.data?.message || err.message || 'Failed to load categories')
  } finally {
    loading.value = false
  }
}

const editCategory = (id) => {
  const category = categories.value.find(c => c.id === id)
  if (category) {
    if (category.isDefault) {
      alert('Default categories cannot be edited.')
      return
    }
    newCategory.value = { name: category.name, icon: category.icon, description: category.description }
    editingId.value = id
    showAddCategory.value = true
  }
}

const deleteCategory = async (id) => {
  const confirmed = confirm('Are you sure you want to delete this category?')
  if (!confirmed) return

  try {
    const category = categories.value.find(c => c.id === id)
    if (category?.isDefault) {
      alert('Default categories cannot be deleted.')
      return
    }
    saving.value = true
    await categoryService.deleteCategory(id)
    categories.value = categories.value.filter(c => c.id !== id)
    alert('Category deleted successfully')
  } catch (err) {
    alert(err.response?.data?.message || err.message || 'Failed to delete category')
  } finally {
    saving.value = false
  }
}

const saveCategory = async () => {
  if (!newCategory.value.name?.trim()) {
    alert('Category name is required')
    return
  }

  const payload = {
    name: newCategory.value.name.trim(),
    description: newCategory.value.description?.trim() || '',
  }

  try {
    saving.value = true
    if (editingId.value) {
      const updated = await categoryService.updateCategory(editingId.value, payload)
      categories.value = categories.value.map(c =>
        c.id === editingId.value ? { ...c, ...updated, icon: newCategory.value.icon || c.icon, description: updated.description || c.description } : c
      )
      alert('Category updated successfully')
    } else {
      const created = await categoryService.addCategory(payload)
      categories.value.push({
        id: created.id,
        name: created.name,
        description: created.description || '',
        icon: newCategory.value.icon || defaultIcon(created.name),
        events: 0,
      })
      alert('Category added successfully')
    }
    resetForm()
    showAddCategory.value = false
  } catch (err) {
    alert(err.response?.data?.message || err.message || 'Failed to save category')
  } finally {
    saving.value = false
  }
}

onMounted(fetchCategories)
</script>
