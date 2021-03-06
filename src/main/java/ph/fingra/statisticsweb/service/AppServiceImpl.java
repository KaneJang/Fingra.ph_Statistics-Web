/**
 * Copyright 2014 tgrape Inc.
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package ph.fingra.statisticsweb.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import ph.fingra.statisticsweb.dao.AppDao;
import ph.fingra.statisticsweb.domain.App;
import ph.fingra.statisticsweb.domain.AppCategory;
import ph.fingra.statisticsweb.domain.DashBoardSearchParam;

@Service
public class AppServiceImpl  implements AppService{

	@Autowired
	private AppDao appDao;
	
    @Override
	public List<AppCategory> findAllCategories() {
	    return appDao.findAllCategories();
	}
	
	@Override
	public App get(String appkey) {
		return appDao.findById(appkey);
	}
	
	@Override
	public void create(App app) {
		appDao.insert(app);
	}

	@Override
	public List<App> getAppList(DashBoardSearchParam param) {
		return appDao.getAppList(param);
	}

	@Override
	public void update(App app) {
		appDao.update(app);
	}
	
	@Override
	public void delete(App app) {
	    appDao.updateAppStatus(app);
	}
}
