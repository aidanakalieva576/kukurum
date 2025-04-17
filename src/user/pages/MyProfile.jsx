import React, { useContext, useState, useRef, useEffect } from 'react'
import { UnifiedContext } from '../../context/UnifiedContext'
import axios from 'axios'

const MyProfile = () => {
  const { userData, token, backendUrl, setUserData } = useContext(UnifiedContext)

  const [editData, setEditData] = useState({
    name: '',
    email: '',
    phone: '',
    gender: '',
    dob: '',
    address: { line1: '', line2: '' },
    image: '',
    imageFile: null
  })

  const [isEdit, setIsEdit] = useState(false)
  const fileInputRef = useRef()

  useEffect(() => {
    if (userData) {
      setEditData({ ...userData, imageFile: null })
    }
  }, [userData])

  const onChange = (field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }))
  }

  const onChangeAddress = (line, value) => {
    setEditData(prev => ({
      ...prev,
      address: { ...prev.address, [line]: value }
    }))
  }

  const onSave = async () => {
    try {
      const formData = new FormData()
      formData.append("name", editData.name)
      formData.append("phone", editData.phone || "")
      formData.append("gender", editData.gender || "")
      formData.append("dob", editData.dob || "")
      formData.append("address", JSON.stringify(editData.address || {}))

      if (editData.imageFile) {
        formData.append("image", editData.imageFile)
      }

      const res = await axios.put(`${backendUrl}/users_api/me`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      })

      setUserData(res.data)
      setEditData({ ...res.data, imageFile: null })
      setIsEdit(false)
    } catch (err) {
      console.error("Ошибка обновления профиля:", err)
      alert("Не удалось сохранить изменения")
    }
  }

  if (!userData) {
    return <p>Загрузка профиля...</p>
  }

  return (
    <div className='max-w-lg flex flex-col gap-2 text-sm'>

      {/* Аватар */}
      <div className="max-w-lg flex flex-col gap-2 text-sm">
        <img
          className='w-36 h-36 object-cover rounded-full cursor-pointer border-2 border-gray-300'
          src={
            editData.imageFile
              ? URL.createObjectURL(editData.imageFile)
              : editData.image || '/default-avatar.png'
          }
          alt="Аватар"
          onClick={() => {
            if (isEdit && fileInputRef.current) {
              fileInputRef.current.click()
            }
          }}
        />

        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={e => {
            const file = e.target.files[0]
            if (file) {
              setEditData(prev => ({ ...prev, imageFile: file }))
            }
          }}
          className="hidden"
        />
      </div>

      {/* Имя */}
      {isEdit ? (
        <input
          className='bg-gray-50 text-3xl font-medium max-w-60 mt-4'
          type="text"
          value={editData.name}
          onChange={e => onChange('name', e.target.value)}
        />
      ) : (
        <p className='font-medium text-3xl text-neutral-800 mt-4'>{userData.name}</p>
      )}

      <hr className='bg-zinc-400 h-[1px] border-none' />

      {/* Контактная информация */}
      <div>
        <p className='text-neutral-500 underline mt-3'>КОНТАКТНАЯ ИНФОРМАЦИЯ</p>
        <div className='grid grid-cols-[1fr_3fr] gap-y-2.5 mt-3 text-neutral-700'>
          <p className='font-medium'>Почта:</p>
          <p className='text-blue-500'>{userData.email}</p>

          <p className='font-medium'>Телефон:</p>
          {isEdit ? (
            <input
              className='bg-gray-100 max-w-52'
              type="text"
              value={editData.phone || ''}
              onChange={e => onChange('phone', e.target.value)}
            />
          ) : (
            <p className='text-blue-400'>{userData.phone}</p>
          )}

          <p className='font-medium'>Адрес:</p>
          {isEdit ? (
            <>
              <input
                className='bg-gray-50'
                type="text"
                value={editData.address?.line1 || ''}
                onChange={e => onChangeAddress('line1', e.target.value)}
              />
              <br />
              <input
                className='bg-gray-50'
                type="text"
                value={editData.address?.line2 || ''}
                onChange={e => onChangeAddress('line2', e.target.value)}
              />
            </>
          ) : (
            <p className='text-gray-500'>
              {userData.address?.line1}<br />
              {userData.address?.line2}
            </p>
          )}
        </div>
      </div>

      {/* Личная информация */}
      <div>
        <p className='text-neutral-500 underline mt-3'>ЛИЧНАЯ ИНФОРМАЦИЯ</p>
        <div className='grid grid-cols-[1fr_3fr] gap-y-2.5 mt-3 text-neutral-700'>
          <p className='font-medium'>Пол:</p>
          {isEdit ? (
            <select
              className='max-w-20 bg-gray-100'
              value={editData.gender}
              onChange={e => onChange('gender', e.target.value)}
            >
              <option value="Мужчина">Мужчина</option>
              <option value="Женщина">Женщина</option>
            </select>
          ) : (
            <p className='text-gray-400'>{userData.gender}</p>
          )}

          <p className='font-medium'>Дата рождения:</p>
          {isEdit ? (
            <input
              className='max-w-28 bg-gray-100'
              type="date"
              value={editData.dob}
              onChange={e => onChange('dob', e.target.value)}
            />
          ) : (
            <p className='text-gray-400'>{userData.dob}</p>
          )}
        </div>
      </div>

      {/* Кнопка */}
      <div className='mt-10'>
        {isEdit ? (
          <button
            className='border border-primary px-8 py-2 rounded-full hover:bg-primary hover:text-white transition-all'
            onClick={onSave}
          >
            Сохранить
          </button>
        ) : (
          <button
            className='border border-primary px-8 py-2 rounded-full hover:bg-primary hover:text-white transition-all'
            onClick={() => {
              setEditData({ ...userData, imageFile: null })
              setIsEdit(true)
            }}
          >
            Редактировать
          </button>
        )}
      </div>
    </div>
  )
}

export default MyProfile
