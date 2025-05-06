import React, { useContext, useState, useRef, useEffect } from 'react'
import { UnifiedContext } from '../../context/UnifiedContext'
import axios from 'axios'
import translations from '../../utils'

const MyProfile = () => {
  const { userData, token, backendUrl, setUserData } = useContext(UnifiedContext)
  const { language } = useContext(UnifiedContext)
  const t = translations[language]

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

    const videoRef = useRef(null)
    const canvasRef = useRef(null)

    const captureAndSendFace = async () => {
    const video = videoRef.current
    const canvas = canvasRef.current

    if (!video || !canvas) return

    const context = canvas.getContext("2d")
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    canvas.toBlob(async (blob) => {
      const formData = new FormData()
      formData.append("file", blob, "face.jpg")

      try {
        const res = await axios.post(`${backendUrl}/face/save_face`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          }
        })
        alert("Лицо успешно сохранено!")
      } catch (err) {
        console.error("Ошибка при отправке лица:", err)
        alert("Ошибка при распознавании лица.")
      }
    }, "image/jpeg")
  }

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    }).catch((err) => {
      console.error("Не удалось получить доступ к камере:", err)
    })
  }, [])


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
      console.log('Sending formData:')
for (let pair of formData.entries()) {
  console.log(pair[0] + ':', pair[1])
}

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
      console.error(t.update_error, err)
      alert(t("profile.update_failed"))
    }
  }

  if (!userData) {
    return <p>{t.loading}</p>
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
          alt={t.avatar}
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
        <p className='text-neutral-500 underline mt-3'>{t.contact_info}</p>
        <div className='grid grid-cols-[1fr_3fr] gap-y-2.5 mt-3 text-neutral-700'>
          <p className='font-medium'>{t.email}:</p>
          <p className='text-blue-500'>{userData.email}</p>

          <p className='font-medium'>{t.phone}:</p>
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

          <p className='font-medium'>{t.address}:</p>
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
        <p className='text-neutral-500 underline mt-3'>{t.personal_info}</p>
        <div className='grid grid-cols-[1fr_3fr] gap-y-2.5 mt-3 text-neutral-700'>
          <p className='font-medium'>{t.gender}:</p>
          {isEdit ? (
            <select
              className='max-w-20 bg-gray-100'
              value={editData.gender}
              onChange={e => onChange('gender', e.target.value)}
            >
              <option value="Мужчина">{t.male}</option>
              <option value="Женщина">{t.female}</option>
            </select>
          ) : (
            <p className='text-gray-400'>{userData.gender}</p>
          )}

          <p className='font-medium'>{t.dob}:</p>
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
      <div className='mt-10 flex gap-4 items-center'>
  {isEdit ? (
    <button
      className='border border-primary px-8 py-2 rounded-full hover:bg-primary hover:text-white transition-all'
      onClick={onSave}
    >
      {t.save}
    </button>
  ) : (
    <button
      className='border border-primary px-8 py-2 rounded-full hover:bg-primary hover:text-white transition-all'
      onClick={() => {
        setEditData({ ...userData, imageFile: null })
        setIsEdit(true)
      }}
    >
      {t.edit}
    </button>
  )}

  {/* Кнопка FaceID */}
  <button
  className='w-10 h-10 flex items-center justify-center border border-gray-400 rounded-full hover:bg-gray-100 transition-all'
  title="Сканировать лицо"
  onClick={captureAndSendFace}
>
  <img
    src="https://www.svgrepo.com/show/325179/face-id.svg"
    alt="Face ID"
    className="w-6 h-6"
  />
</button>
<video ref={videoRef} autoPlay className="hidden" />
<canvas ref={canvasRef} className="hidden" />

</div>
    </div>
    
  )
}

export default MyProfile
